import { Provider, Shell, DynamicModule, DynamicModuleOptions, Identity, AppEvent } from '@ulaval/shell-ui';

enum State {
    REGISTERED,
    LOADING,
    LOADED,
    MOUNTING,
    MOUNTED,
    UNMOUNTING
}

class ModuleState {

    state: State = State.REGISTERED;
    module?: DynamicModule;
    loadingPromise?: Promise<DynamicModule> | null;
    mountingPromise?: Promise<DynamicModule> | null;
    unmountingPromise?: Promise<DynamicModule> | null;
    err?;

    constructor(
        public options: DynamicModuleOptions
    ) {

    }
}

export class ShellImpl implements Shell {

    private readonly registeredModules: { [moduleName: string]: ModuleState } = {};
    private identityPromise: Promise<Identity>;
    private gaPromise: Promise<UniversalAnalytics.ga>;

    public constructor(
        public identityProvider: Provider<Identity>,
        public auditMethod: (event: AppEvent) => void,
        public gaProvider: Provider<UniversalAnalytics.ga>
    ) {

    }

    registerModule(moduleOptions: DynamicModuleOptions) {
        if (this.registeredModules[moduleOptions.moduleName]) {
            throw new Error(`Module + ${moduleOptions.moduleName} is already registered.`);
        }

        this.registeredModules[moduleOptions.moduleName] = new ModuleState(moduleOptions);
    }

    registerModules(modulesOptions: [DynamicModuleOptions]) {
        for (let i = 0; i < modulesOptions.length; ++i) {
            this.registerModule(modulesOptions[i]);
        }
    }

    loadModule(moduleName: string): Promise<DynamicModule> {
        let moduleState = this.get(moduleName);

        if (moduleState.loadingPromise) {
            return moduleState.loadingPromise;
        }

        if (typeof moduleState.options.load === 'function') {
            moduleState.state = State.LOADING;

            moduleState.loadingPromise = moduleState.options.load(moduleState.options)
                .then(
                mod => this.onModuleLoaded(moduleState, mod),
                err => this.onModuleError(moduleState, err));
        } else {
            moduleState.loadingPromise = loadScript(moduleState.options.load, 10000)
                .then(() => window[moduleName]);
        }

        return moduleState.loadingPromise;
    }

    mountModule(moduleName: string): Promise<DynamicModule> {
        let moduleState = this.get(moduleName);

        if (moduleState.mountingPromise) {
            return moduleState.mountingPromise;
        }

        if (moduleState.state == State.MOUNTED) {
            return Promise.resolve(moduleState.module);
        }

        if (moduleState.state == State.LOADED) {
            return this.doMount(moduleState);
        }

        if (moduleState.loadingPromise) {
            return moduleState.loadingPromise.then(() => this.doMount(moduleState));
        }

        if (moduleState.unmountingPromise) {
            return moduleState.unmountingPromise.then(() => this.doMount(moduleState));
        }

        return this.loadModule(moduleName).then(() => this.doMount(moduleState));
    }

    unmountModule(moduleName: string): Promise<DynamicModule> {
        let moduleState = this.get(moduleName);

        if (moduleState.unmountingPromise) {
            return moduleState.unmountingPromise;
        }

        if (moduleState.state != State.MOUNTED || !moduleState.module) {
            throw new Error(`The module ${moduleName} is not mounted: ${moduleState.state}.`);
        }

        moduleState.state = State.UNMOUNTING;
        moduleState.unmountingPromise = moduleState.module.unmount().then(
            () => {
                moduleState.state = State.LOADED;
                moduleState.unmountingPromise = null;
                return moduleState.module;
            },
            (err) => {
                moduleState.state = State.LOADED;
                moduleState.unmountingPromise = null;
                this.auditError(`Error while unmounting module ${moduleState.options.moduleName}.`, err);
                return err;
            }
        );

        return moduleState.unmountingPromise;
    }

    navigateTo(pathName: string) {
        throw new Error('Not implemented');
    }

    emit(event: AppEvent) {
        if (!event) {
            return;
        }

        for (let moduleName in this.registeredModules) {
            let moduleState = this.registeredModules[moduleName];

            if (moduleState.state == State.MOUNTED && moduleState.module) {
                moduleState.module.onEvent(event);
            }
        }
    }

    identity(): Promise<Identity> {
        return this.identityPromise || (this.identityPromise = this.identityProvider.load());
    }

    auditError(msg: string, err: any) {
        let event = {
            eventType: 'js',
            params: {
                err: err
            }
        };

        this.auditMethod(event);
    }

    auditNavigation(srcUrl: string, destUrl: string) {
        let event = {
            eventType: 'navigation',
            params: {
                srcUrl,
                destUrl
            }
        };

        this.auditMethod(event);
    }

    auditRestError(serviceName: string, url: string, params: any, err: any) {
        let event = {
            eventType: 'rest',
            params: {
                serviceName,
                url,
                params,
                err
            }
        };

        this.auditMethod(event);
    }

    auditGenericEvent(eventType: string, params: any) {
        let event = {
            eventType,
            params
        };

        this.auditMethod(event);
    }

    ga(): Promise<UniversalAnalytics.ga> {
        return this.gaPromise || (this.gaPromise = this.gaProvider.load());
    }

    private get(moduleName: string): ModuleState {
        let m = this.registeredModules[moduleName];

        if (!m) {
            throw new Error(`The module ${moduleName} is not registered.`);
        }

        return m;
    }

    private onModuleLoaded(registeredModule: ModuleState, module: DynamicModule): DynamicModule {
        registeredModule.module = module;
        registeredModule.loadingPromise = null;
        registeredModule.state = State.LOADED;
        return module;
    }

    private onModuleError(moduleState: ModuleState, err): any {
        moduleState.loadingPromise = null;
        moduleState.state = State.REGISTERED;
        this.auditError(`Error while loading module ${moduleState.options.moduleName}.`, err);
        return err;
    }

    private doMount(moduleState: ModuleState): Promise<DynamicModule> {
        if (!moduleState.module || moduleState.state != State.LOADED) {
            throw new Error(`The module ${moduleState.options.moduleName} is not loaded.`);
        }

        moduleState.state = State.MOUNTING;
        moduleState.mountingPromise = moduleState.module.mount(this).then(
            () => {
                moduleState.state = State.MOUNTED;
                moduleState.mountingPromise = null;
                return moduleState.module;
            },
            (err) => {
                moduleState.state = State.LOADED;
                moduleState.mountingPromise = null;
                this.auditError(`Error while mounting module ${moduleState.options.moduleName}.`, err);
                return err;
            });

        return moduleState.mountingPromise;
    }
}

function loadScript(url, timeout): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        script.src = url;
        script.onload = () => resolve(script);
        head.appendChild(script);
        window.setTimeout(() => reject(new Error(`Timeout while loading ${url}.`)), timeout);
    });
}
