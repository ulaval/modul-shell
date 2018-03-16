export const SHELL_GLOBAL_VAR: string = 'modul-shell';

/**
 * Creates a shell to handle a multi-package application.
 *
 * @param global 'True' will install the shell in the window global variable
 */
export const createShell: (global?: boolean) => Shell = global => {
    let shell: Shell = new ShellImpl();

    if (global) {
        window[SHELL_GLOBAL_VAR] = shell;
    }

    return shell;
};

type PackagesMap = {
    [packageName: string]: PackageState
};

type ServicesMap = {
    [serviceName: string]: any
};

export class NoPackageForPathError extends Error {
    constructor(msg, public path) {
        super(msg);
        this.name = 'NoPackageForPathError';
    }
}

/**
 * Interface to cummunicate with the shell.
 */
export interface Shell {
    /**
     * Register a new package so that it can be loaded and mounted.
     */
    registerPackage(packageOptions: PackageOptions);

    /**
     * Register a series of new packages so that they can be loaded and mounted.
     */
    registerPackages(packagesOptions: PackageOptions[]);

    /**
     * Register a service (can be an object, a function etc.) with a key name.
     */
    registerService(serviceName: string, service: any);

    /**
     * Loads the package in advance so that it is ready to be mounted.
     */
    loadPackage(packageName: string): Promise<Package>;

    /**
     * Activates the package, if the package is not loaded, it will be.
     */
    mountPackage(packageName: string): Promise<Package>;

    /**
     * Puts a package back in the loaded state.
     */
    unmountPackage(packageName: string): Promise<Package>;

    /**
     * Initiates the shell and loads the fist package according to the current URL.
     */
    start();

    /**
     * Allows to navigate between packages.
     */
    navigateTo(pathName: string): void;

    /**
     * Emits an event for other packages to consume.
     */
    emit(eventType: string, params?: any);

    loadScript(url, timeout): Promise<HTMLScriptElement>;

    /**
     * Returns a registered service by its name.
     */
    getService<T>(serviceName: string): T;
}

/**
 * A dynamically loaded package needs to implement this interface to
 * work properly with the shell.
 */
export interface Package {
    /**
     * Mounts the package into action.
     *
     * The package needs to be in the loaded state for this to work.
     */
    mount(shell: Shell, options: PackageOptions): Promise<void>;

    /**
     * Takes a mounted package and puts it back into the loaded state.
     */
    unmount(): Promise<void>;

    /**
     * Receives events emitted through the Shell.emit() method.
     */
    onEvent(eventType: string, params?: any);
}

export interface PackageOptions {
    /**
     * The package name. This needs to be unique.
     */
    packageName: string;

    /**
     * A callback to load the package or an URL to dynamically load a javascript.
     */
    load: (() => Promise<Package>) | string;

    /**
     * The root path of the package. For example: '/courses'.
     * Packages are not always mounted on navigation, they can be explicitly mounted by another package.
     */
    rootPath?: string;

    /**
     * Where to mount the package.
     * A package don't always need an element to be mounted. Some packages can stay hidden
     * or create their own elements.
     */
    rootElement?: HTMLElement | string;

    /**
     * Optional parameters to pass to the package while mounting.
     */
    params?: { [key: string]: any };

    /**
     * For chunk loading, will set the __webpack_public_path__ var.
     */
    repoPublicPath?: string;
}

enum State {
    REGISTERED,
    LOADING,
    LOADED,
    MOUNTING,
    MOUNTED,
    UNMOUNTING
}

class PackageState {

    state: State = State.REGISTERED;
    package?: Package;
    loadingPromise?: Promise<Package> | null;
    mountingPromise?: Promise<Package> | null;
    unmountingPromise?: Promise<Package> | null;
    err?;

    constructor(
        public options: PackageOptions
    ) {
        // TODO: ensure element id (if defined) exists
    }
}

class ShellImpl implements Shell {
    private readonly registeredPackages: PackagesMap = {};
    private readonly services: ServicesMap = {};
    private currentPackage: PackageState;

    registerPackage(packageOptions: PackageOptions): void {
        if (this.registeredPackages[packageOptions.packageName]) {
            throw new Error(`Package + ${packageOptions.packageName} is already registered.`);
        }

        this.registeredPackages[packageOptions.packageName] = new PackageState(packageOptions);
    }

    registerPackages(packagesOptions: [PackageOptions]): void {
        for (let i = 0; i < packagesOptions.length; ++i) {
            this.registerPackage(packagesOptions[i]);
        }
    }

    registerService(serviceName: string, service: any): void {
        if (this.services[serviceName]) {
            throw new Error(`There is already a registered service for ${serviceName}`);
        }
        this.services[serviceName] = service;
    }

    loadPackage(packageName: string): Promise<Package> {
        let packageState = this.get(packageName);

        if (packageState.loadingPromise) {
            return packageState.loadingPromise;
        }

        if (typeof packageState.options.load === 'function') {
            packageState.state = State.LOADING;

            packageState.loadingPromise = packageState.options.load()
                .then(
                    mod => this.onPackageLoaded(packageState, mod),
                    err => {
                        this.onPackageError(packageState, err);
                        throw err;
                    });
        } else {
            packageState.loadingPromise = this.loadScript(packageState.options.load, 10000)
                .then(
                    mod => {
                        return this.onPackageLoaded(packageState, window[packageName]);
                    },
                    err => {
                        this.onPackageError(packageState, err);
                        throw err;
                    });
        }

        return packageState.loadingPromise;
    }

    mountPackage(packageName: string): Promise<Package> {
        let packageState = this.get(packageName);

        if (packageState.mountingPromise) {
            return packageState.mountingPromise;
        }

        if (packageState.state == State.MOUNTED) {
            return Promise.resolve(packageState.package);
        }

        if (packageState.state == State.LOADED) {
            return this.doMount(packageState);
        }

        if (packageState.loadingPromise) {
            return packageState.loadingPromise.then(() => this.doMount(packageState), (err) => { throw err; });
        }

        if (packageState.unmountingPromise) {
            return packageState.unmountingPromise.then(() => this.doMount(packageState), (err) => { throw err; });
        }

        return this.loadPackage(packageName).then(() => this.doMount(packageState), (err) => { throw err; });
    }

    unmountPackage(packageName: string): Promise<Package> {
        let packageState = this.get(packageName);

        if (packageState.unmountingPromise) {
            return packageState.unmountingPromise;
        }

        if (packageState.state != State.MOUNTED || !packageState.package) {
            return Promise.reject(new Error(`The package ${packageName} is not mounted: ${packageState.state}.`));
        }

        packageState.state = State.UNMOUNTING;
        packageState.unmountingPromise = packageState.package.unmount().then(
            () => {
                packageState.state = State.LOADED;
                packageState.unmountingPromise = null;
                return packageState.package;
            },
            (err) => {
                packageState.state = State.LOADED;
                packageState.unmountingPromise = null;
                return err;
            }
        );

        return packageState.unmountingPromise;
    }

    navigateTo(path: string): void {
        history.pushState(path, path, path);
        this.showCurrentPackages();
    }

    emit(eventType: string, params?: any) {
        for (let packageName in this.registeredPackages) {
            let packageState = this.registeredPackages[packageName];

            if (packageState.state == State.MOUNTED && packageState.package && packageState.package.onEvent) {
                packageState.package.onEvent(eventType, params);
            }
        }
    }

    start() {
        window.addEventListener('popstate', (ev) => {
            console.log(ev);
            // Required to prevent the browser from overriding the url
            window.setTimeout(() => this.showCurrentPackages(), 1);
        });
        this.showCurrentPackages();
    }

    loadScript(url, timeout): Promise<HTMLScriptElement> {
        return new Promise((resolve, reject) => {
            try {
                const head = document.getElementsByTagName('head')[0];
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.charset = 'utf-8';
                script.async = true;
                script.src = url;
                script.onload = () => resolve(script);
                script.onerror = (err) => reject(err);
                head.appendChild(script);
            } catch (e) {
                reject(e);
            }
        });
    }

    getService<T>(serviceName: string): T {
        return this.services[serviceName];
    }

    private showCurrentPackages(): void {
        let path = window.location.pathname;

        let packageState = this.findPackageByPath(path);

        if (packageState == null) {
            if (this.currentPackage) {
                this.unmountPackage(this.currentPackage.options.packageName);
            }

            throw new NoPackageForPathError(`No package matches "${path}"`, path);
        }

        if (this.currentPackage && this.currentPackage === packageState) {
            return;
        }

        if (this.currentPackage) {
            this.unmountPackage(this.currentPackage.options.packageName)
                .then(
                    () => this.mountPackage((packageState as PackageState).options.packageName),
                    () => this.mountPackage((packageState as PackageState).options.packageName));
        } else {
            this.mountPackage(packageState.options.packageName);
        }
    }

    private findPackageByPath(path: string): PackageState | null {
        let bestMatchLength = 0;
        let bestMatch: PackageState | null = null;

        for (let packageName in this.registeredPackages) {
            let packageState = this.registeredPackages[packageName];

            if (packageState.options.rootPath
                && packageState.options.rootPath.length > bestMatchLength
                && path.indexOf(packageState.options.rootPath) === 0) {
                bestMatchLength = packageState.options.rootPath.length;
                bestMatch = packageState;
            }
        }

        return bestMatch;
    }

    private get(packageName: string): PackageState {
        let packageState = this.registeredPackages[packageName];

        if (!packageState) {
            throw new Error(`The package ${packageName} is not registered.`);
        }

        return packageState;
    }

    private onPackageLoaded(registeredPackages: PackageState, pack: Package): Package {
        registeredPackages.package = pack;
        registeredPackages.loadingPromise = null;
        registeredPackages.state = State.LOADED;
        return pack;
    }

    private onPackageError(packageState: PackageState, err): any {
        packageState.loadingPromise = null;
        packageState.state = State.REGISTERED;
        return err;
    }

    private doMount(packageState: PackageState): Promise<Package> {
        if (!packageState.package || packageState.state != State.LOADED) {
            throw new Error(`The package ${packageState.options.packageName} is not loaded.`);
        }

        if (packageState.options.rootPath) {
            // TODO: only one package per route path?
            this.currentPackage = packageState;
        }

        packageState.state = State.MOUNTING;

        packageState.mountingPromise = packageState.package.mount(this, packageState.options).then(
            () => {
                packageState.state = State.MOUNTED;
                packageState.mountingPromise = null;
                return packageState.package as Package; // not null
            },
            (err) => {
                packageState.state = State.LOADED;
                packageState.mountingPromise = null;
                throw err;
            });

        return packageState.mountingPromise;
    }
}
