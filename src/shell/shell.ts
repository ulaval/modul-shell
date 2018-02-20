
/**
 * Creates a shell to handle a multi-package application.
 *
 * @param identityServiceFactory The factory to create an identity service
 * @param auditServiceFactory The factory to create an audit service
 * @param analyticsServiceFactory  The factory to create an analytics service
 */
export const createShell = () => new ShellImpl() as Shell;

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

// type InlineConstructor<T> = (...args: any[]) => T;

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

    // /**
    //  * Gives access to the identity service.
    //  */
    // identity(): IdentityService;

    // /**
    //  * Gives access to the audit service.
    //  */
    // audit(): AuditService;

    // /**
    //  * Gives access to the analytics service.
    //  */
    // analytics(): AnalyticsService;

    loadScript(url, timeout): Promise<HTMLScriptElement>;

    /**
     * Dependency injection? Will work well-known packages, but not really for dynamically loaded ones.
     */
    getService<T>(serviceName: string): T;

    /**
     * Injector? this is a test...
     */
    // package(packageName: string, inlineConstructor: any[]);
}

// export interface IdentityService {
//     updateIdentity(identity: Identity): void;
//     identity(): Promise<Identity>;
//     requireAuthenticatedIdentity(): Promise<Identity>;
//     logout(): void;
// }

// export interface AuditService {
//     /**
//      * Audits a javascript error.
//      */
//     auditError(errorId: string, msg: string, err: any);

//     /**
//      * Audits a web navigation.
//      */
//     auditNavigation(srcUrl: string, destUrl: string);

//     /**
//      * Audits an error while invoking a rest service.
//      */
//     auditRestError(errorId: string, url: string, method: string, params: any, statusCode: number, data?: any);

//     /**
//      * Audit a generic event.
//      */
//     audit(eventId: string, eventType: string, params?: any);
// }

// export interface AnalyticsService {
//     ga(): Promise<UniversalAnalytics.ga>;
// }

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

// export interface Identity {
//     /**
//      * If the current user is authenticated.
//      */
//     authenticated: boolean;

//     /**
//      * The user's account used to open the current session.
//      */
//     currentAccount: Account;

//     /**
//      * The user if authenticated.
//      */
//     user?: User;

//     /**
//      * Token to use for invoking secured services.
//      */
//     token?: Token;

//     /**
//      * Extra proprietary attributes.
//      */
//     attributes: any;
// }

// export interface User {

//     /**
//      * If the current user is a system.
//      */
//     system: boolean;

//     /**
//      * User ids by system.
//      *
//      * The following are provided when using ulaval's identity system:
//      * - mpo: monPortail's internal id
//      * - ena: ena's internal id
//      * - set: idDossierIndividuEtudes
//      * - numeroDossier: Numéro de dossier used by the RIC
//      * - pidm: The PIDM used in Banner
//      * - codePermanent: permanent code
//      * - ni: numéro d'identification
//      */
//     userIdsBySystem: { [systeme: string]: string };

//     /**
//      * A user can have multiple accounts.
//      *
//      * For example, a Google and Facebook accounts.
//      */
//     accounts: Account[];

//     /**
//      * User's first name.
//      */
//     givenName?: string;

//     /**
//      * User's last name.
//      */
//     familyName?: string;

//     /**
//      * Primary email adresse to use when communicating with the user.
//      */
//     primaryEmailAdress: string;

//     /**
//      * Is the user a male or a female.
//      */
//     gender?: 'male' | 'female';

//     /**
//      * The user's birthdate.
//      */
//     birthdate?: Date;

//     /**
//      * Is the user suspended.
//      */
//     suspended: boolean;

//     /**
//      * The user's expiration date.
//      */
//     expiration?: Date;

//     /**
//      * A user is active if he is not suspended or expired.
//      */
//     active: boolean;

//     /**
//      * The user's preferences.
//      */
//     userPreferences: UserPreferences;

//     /**
//      * List of access granted to the current user.
//      */
//     accesses: Access[];

//     /**
//      * The change number increments each time a user is changed.
//      */
//     changeNumber: number;
// }

// /**
//  * The user's preferences contains all parameters that are completely under the control of the user.
//  */
// export interface UserPreferences {
//     /**
//      * Visible name to show in forums and other collaborative tools.
//      */
//     pseudonym?: string;

//     /**
//      * Url to download the current picture of the user.
//      */
//     picture?: string;

//     /**
//      * Preferred language to communicate with the user.
//      */
//     lang: string;

//     /**
//      * Should we use the color blind version of the app.
//      */
//     colorBlind?: boolean;

//     /**
//      * Timezone to display date/times.
//      */
//     timezone?: string;
// }

// /**
//  * User account to allow a user to authenticate.
//  */
// export interface Account {
//     /**
//      * The account type.
//      * If the user is not authenticated, the account type is 'anonymous'.
//      */
//     accountType: 'anonymous' | 'email' | 'google' | 'facebook' | 'ul' | string;

//     /**
//      * The user name or email adress.
//      */
//     userName: 'anonymous' | string;

//     /**
//      * The password expiration date.
//      */
//     pwdExpiration?: Date;
// }

// export interface Token {
//     /**
//      * For example: 'Bearer'.
//      */
//     tokenType: string;

//     /**
//      * The security token.
//      */
//     accessToken: string;

//     /**
//      * The system for whom the token was generated.
//      */
//     clientId: string;

//     /**
//      * The security scope of the token.
//      */
//     scope?: string;

//     /**
//      * The expiration time of the token.
//      */
//     expiration: Date;
// }

// export interface Access {
//     /**
//      * The source of the access.
//      */
//     src: string;

//     /**
//      * The role granted.
//      */
//     role: string;

//     resourceType: string;

//     resourceId: string;

//     /**
//      * The expiration time of the access.
//      * If null, the access has no expiration.
//      */
//     expiration?: Date;

//     /**
//      * Was the access suspended by an administrator.
//      */
//     suspended: boolean;

//     /**
//      * An access is active if it is not suspended and if it is not expired.
//      */
//     active: boolean;

//     /**
//      * Was the access obtained through a group.
//      */
//     direct: boolean;
// }

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
    // private readonly identityService: IdentityService;
    // private readonly auditService: AuditService;
    // private readonly analyticsService: AnalyticsService;
    private readonly registeredPackages: PackagesMap = {};
    private readonly services: ServicesMap = {};
    private currentPackage: PackageState;

    public constructor() {
        // this.identityService = identityServiceFactory(this);
        // this.auditService = auditServiceFactory(this);
        // this.analyticsService = analyticsServiceFactory(this);
    }

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
                // this.audit().auditError('0', `Error while unmounting package ${packageState.options.packageName}.`, err);
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

    // identity(): IdentityService {
    //     return this.identityService;
    // }

    // audit(): AuditService {
    //     return this.auditService;
    // }

    // analytics(): AnalyticsService {
    //     return this.analyticsService;
    // }

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

    // package(packageName: string, inlineConstructor: any[]) {
    //     let c = inlineConstructor[inlineConstructor.length - 1];
    //     let o: any = Object.create(c.prototype);
    //     o.showMe();
    //     if (inlineConstructor.length == 1) {
    //         c.apply(o, []);
    //     } else {
    //         c.apply(o, inlineConstructor.slice(0, inlineConstructor.length - 1));
    //     }

    //     o.showMe();
    // }

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
        // this.audit().auditError('0', `Error while loading package ${packageState.options.packageName}.`, err);
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
                // this.audit().auditError('0', `Error while mounting package ${packageState.options.packageName}.`, err);
                throw err;
            });

        return packageState.mountingPromise;
    }
}
