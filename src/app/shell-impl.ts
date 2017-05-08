import { Shell, DynamicModule, DynamicModuleOptions, Identity, AppEvent } from "@ulaval/shell-ui"

enum State {
    REGISTERED,
    LOADING,
    LOADED,
    MOUNTING,
    MOUNTED,
    UNMOUNTING,
    ERROR
}

class ModuleState {

    state: State = State.REGISTERED;
    module?: DynamicModule;
    loadingPromise?: Promise<DynamicModule> | null;
    mountingPromise?: Promise<DynamicModule> | null;
    unmountingPromise?: Promise<void> | null;
    err?;

    constructor(
        public options: DynamicModuleOptions
    ) {

    }
}

export class ShellImpl implements Shell {

    private readonly registeredModules: { [moduleName: string]: ModuleState } = {};

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

        if (typeof moduleState.options.load === "function") {
            moduleState.state = State.LOADING;

            moduleState.loadingPromise = moduleState.options.load(moduleState.options)
                .then(
                mod => this.onModuleLoaded(moduleState, mod),
                err => this.onModuleError(moduleState, err))
        } else {
            moduleState.loadingPromise = loadScript(moduleState.options.load, 10000)
                .then(() => window[moduleName])
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

        if (moduleState.state == State.ERROR) {
            return Promise.reject(moduleState.err);
        }

        if (moduleState.unmountingPromise) {
            return moduleState.unmountingPromise.then(() => this.doMount(moduleState));
        }

        return this.loadModule(moduleName).then(() => this.doMount(moduleState));
    }

    unmountModule(moduleName: string): Promise<DynamicModule> {
        return Promise.reject(new Error("Not implemented"));
    }

    navigateTo(pathName: string) {

    }

    emit(message: string | AppEvent, params?: any) {

    }

    identity(): Promise<Identity> {
        return Promise.reject(new Error("Not implemented"));
    }

    audit(event: AppEvent) {
        throw new Error("Not implemented");
    }

    ga(): Promise<UniversalAnalytics.ga> {
        return Promise.reject(new Error("Not implemented"));
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
        registeredModule.state = State.LOADED;
        return module;
    }

    private onModuleError(registeredModule: ModuleState, err): any {
        registeredModule.err = err;
        registeredModule.state = State.ERROR;
        return err;
    }

    private doMount(moduleState: ModuleState): Promise<DynamicModule> {
        if (!moduleState.module || moduleState.state != State.LOADED) {
            throw new Error(`The module ${moduleState.options.moduleName} is not loaded.`);
        }

        moduleState.state = State.MOUNTING;
        moduleState.mountingPromise = moduleState.module.mount(this).then(() => {
            moduleState.state = State.MOUNTED;
            moduleState.mountingPromise = null;
            return moduleState.module
        },
        (err) => {
            moduleState.state = State.ERROR;
            moduleState.mountingPromise = null;
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