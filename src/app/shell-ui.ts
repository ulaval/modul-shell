
export const createShell = function(
    identityServiceFactory: (shell: Shell) => IdentityService,
    auditServiceFactory: (shell: Shell) => AuditService,
    analyticsServiceFactory: (shell: Shell) => AnalyticsService): Shell {

    return new ShellImpl(identityServiceFactory, auditServiceFactory, analyticsServiceFactory);
};

/**
 * Interface to cummunicate with the shell.
 */
export interface Shell {
    /**
     * Register a new dynamic module so that it can be loaded and mounted.
     */
    registerModule(moduleOptions: DynamicModuleOptions);

    /**
     * Register a series of new dynamic modules so that they can be loaded and mounted.
     */
    registerModules(modulesOptions: [DynamicModuleOptions]);

    /**
     * Loads the module in advance so that it is ready to be mounted.
     */
    loadModule(moduleName: string): Promise<DynamicModule>;

    /**
     * Activates the module, if the module is not loaded, it will be.
     */
    mountModule(moduleName: string): Promise<DynamicModule>;

    /**
     * Puts a module back in the loaded state.
     */
    unmountModule(moduleName: string): Promise<DynamicModule>;

    /**
     * Initiates the shell and loads the fist module according to the current URL.
     */
    start();

    /**
     * Allows to navigate between modules.
     */
    navigateTo(pathName: string);

    /**
     * Emits an event for other modules to consume.
     */
    emit(eventType: string, params?: any);

    /**
     * Gives access to the identity service.
     */
    identity(): IdentityService;

    /**
     * Gives access to the audit service.
     */
    audit(): AuditService;

    /**
     * Gives access to the analytics service.
     */
    analytics(): AnalyticsService;
}

export interface IdentityService {
    updateIdentity(identity: Identity): void;
    identity(): Promise<Identity>;
    requireAuthenticatedIdentity(): Promise<Identity>;
    logout(): void;
}

export interface AuditService {
    /**
     * Audits a javascript error.
     */
    auditError(errorId: string, msg: string, err: any);

    /**
     * Audits a web navigation.
     */
    auditNavigation(srcUrl: string, destUrl: string);

    /**
     * Audits an error while invoking a rest service.
     */
    auditRestError(errorId: string, url: string, method: string, params: any, statusCode: number, data?: any);

    /**
     * Audit a generic event.
     */
    audit(eventId: string, eventType: string, params?: any);
}

export interface AnalyticsService {
    ga(): Promise<UniversalAnalytics.ga>;
}

/**
 * A dynamically loaded module needs to implement this interface to
 * work properly with the shell.
 */
export interface DynamicModule {
    /**
     * Mounts the module into action.
     *
     * The module needs to be in the loaded state for this to work.
     */
    mount(shell: Shell, options: DynamicModuleOptions): Promise<void>;

    /**
     * Takes a mounted modules and puts it back into the loaded state.
     */
    unmount(): Promise<void>;

    /**
     * Receives events emitted through the Shell.emit() method.
     */
    onEvent(eventType: string, params?: any);
}

export interface Identity {
    /**
     * If the current user is authenticated.
     */
    authenticated: boolean;

    /**
     * The user name used to open the session or 'anonymous' if not authenticated.
     */
    currentUserName: 'anonymous' | string;

    /**
     * The user if authenticated.
     */
    user?: User;

    /**
     * Token to use for invoking secured services.
     */
    token?: Token;
}

export interface User {

    /**
     * If the current user is a system.
     */
    system: boolean;

    /**
     * The user's account used to open the current session.
     */
    currentAccount: Account;

    /**
     * User ids by system.
     *
     * The following are provided when using ulaval's identity system:
     * - mpo: monPortail's internal id
     * - ena: ena's internal id
     * - set: idDossierIndividuEtudes
     * - numeroDossier: Numéro de dossier used by the RIC
     * - pidm: The PIDM used in Banner
     * - codePermanent: permanent code
     * - ni: numéro d'identification
     */
    userIdsBySystem: { [systeme: string]: string };

    /**
     * A user can have multiple accounts.
     *
     * For example, a Google and Facebook accounts.
     */
    accounts: Account[];

    /**
     * User's first name.
     */
    givenName?: string;

    /**
     * User's last name.
     */
    familyName?: string;

    /**
     * Primary email adresse to use when communicating with the user.
     */
    primaryEmailAdress: string;

    /**
     * Is the user a male or a female.
     */
    gender?: 'male' | 'female';

    /**
     * The user's birthdate.
     */
    birthdate?: Date;

    /**
     * Is the user suspended.
     */
    suspended: boolean;

    /**
     * The user's expiration date.
     */
    expiration?: Date;

    /**
     * A user is active if he is not suspended or expired.
     */
    active: boolean;

    /**
     * The user's preferences.
     */
    userPreferences: UserPreferences;

    /**
     * List of access granted to the current user.
     */
    accesses: Access[];

    /**
     * The change number increments each time a user is changed.
     */
    changeNumber: number;
}

/**
 * The user's preferences contains all parameters that are completely under the control of the user.
 */
export interface UserPreferences {
    /**
     * Visible name to show in forums and other collaborative tools.
     */
    pseudonym?: string;

    /**
     * Url to download the current picture of the user.
     */
    picture?: string;

    /**
     * Preferred language to communicate with the user.
     */
    lang: string;

    /**
     * Should we use the color blind version of the app.
     */
    colorBlind?: boolean;

    /**
     * Timezone to display date/times.
     */
    timezone?: string;
}

/**
 * User account to allow a user to authenticate.
 */
export interface Account {
    /**
     * The account type.
     */
    accountType: 'email' | 'google' | 'facebook' | 'ul' | string;

    /**
     * The user name or email adress.
     */
    userName: string;

    /**
     * The password expiration date.
     */
    pwdExpiration?: Date;
}

export interface Token {
    /**
     * For example: 'Bearer'.
     */
    tokenType: string;

    /**
     * The security token.
     */
    accessToken: string;

    /**
     * The system for whom the token was generated.
     */
    clientId: string;

    /**
     * The security scope of the token.
     */
    scope?: string;

    /**
     * The expiration time of the token.
     */
    expiration: Date;
}

export interface Access {
    /**
     * The source of the access.
     */
    src: string;

    /**
     * The role granted.
     */
    role: string;

    resourceType: string;

    resourceId: string;

    /**
     * The expiration time of the access.
     * If null, the access has no expiration.
     */
    expiration?: Date;

    /**
     * Was the access suspended by an administrator.
     */
    suspended: boolean;

    /**
     * An access is active if it is not suspended and if it is not expired.
     */
    active: boolean;

    /**
     * Was the access obtained through a group.
     */
    direct: boolean;
}

export interface DynamicModuleOptions {
    /**
     * The module name. This needs to be unique.
     */
    moduleName: string;

    /**
     * A callback to load the module or an URL to dynamically load a javascript.
     */
    load: (() => Promise<DynamicModule>) | string;

    /**
     * The root path of the module. For example: '/courses'.
     * Modules are not always mounted on navigation, they can be explicitly mounted by another module.
     */
    rootPath?: string;

    /**
     * Where to mount the module.
     * A module don't always need an element to be mounted. Some modules can stay hidden
     * or create their own elements.
     */
    rootElement?: HTMLElement | string;

    /**
     * Optional parameters to pass to the module while mounting the module.
     */
    params?: { [key: string]: any };
}

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

class ShellImpl implements Shell {
    private readonly identityService: IdentityService;
    private readonly auditService: AuditService;
    private readonly analyticsService: AnalyticsService;
    private readonly registeredModules: { [moduleName: string]: ModuleState } = {};
    private currentPathModule: ModuleState;

    public constructor(
        identityServiceFactory: (shell: Shell) => IdentityService,
        auditServiceFactory: (shell: Shell) => AuditService,
        analyticsServiceFactory: (shell: Shell) => AnalyticsService
    ) {
        this.identityService = identityServiceFactory(this);
        this.auditService = auditServiceFactory(this);
        this.analyticsService = analyticsServiceFactory(this);
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

            moduleState.loadingPromise = moduleState.options.load()
                .then(
                mod => this.onModuleLoaded(moduleState, mod),
                err => {
                    this.onModuleError(moduleState, err);
                    throw err;
                });
        } else {
            moduleState.loadingPromise = loadScript(moduleState.options.load, 10000)
                .then(
                mod => {
                    return this.onModuleLoaded(moduleState, window[moduleName]);
                },
                err => {
                    this.onModuleError(moduleState, err);
                    throw err;
                });
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
            return moduleState.loadingPromise.then(() => this.doMount(moduleState), (err) => { throw err; });
        }

        if (moduleState.unmountingPromise) {
            return moduleState.unmountingPromise.then(() => this.doMount(moduleState), (err) => { throw err; });
        }

        return this.loadModule(moduleName).then(() => this.doMount(moduleState), (err) => { throw err; });
    }

    unmountModule(moduleName: string): Promise<DynamicModule> {
        let moduleState = this.get(moduleName);

        if (moduleState.unmountingPromise) {
            return moduleState.unmountingPromise;
        }

        if (moduleState.state != State.MOUNTED || !moduleState.module) {
            return Promise.reject(new Error(`The module ${moduleName} is not mounted: ${moduleState.state}.`));
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
                this.audit().auditError('0', `Error while unmounting module ${moduleState.options.moduleName}.`, err);
                return err;
            }
        );

        return moduleState.unmountingPromise;
    }

    navigateTo(path: string) {
        history.pushState(path, path, path);
        this.showCurrentModule();
    }

    emit(eventType: string, params?: any) {
        if (!event) {
            return;
        }

        for (let moduleName in this.registeredModules) {
            let moduleState = this.registeredModules[moduleName];

            if (moduleState.state == State.MOUNTED && moduleState.module) {
                moduleState.module.onEvent(eventType, params);
            }
        }
    }

    start() {
        window.addEventListener('popstate', (ev) => {
            // Required to prevent the browser from overriding the url
            window.setTimeout(() => this.showCurrentModule(), 1);
        });
        this.showCurrentModule();
    }

    identity(): IdentityService {
        return this.identityService;
    }

    audit(): AuditService {
        return this.auditService;
    }

    analytics(): AnalyticsService {
        return this.analyticsService;
    }

    private showCurrentModule() {
        let path = window.location.pathname;

        let moduleState = this.findModuleByPath(path);

        if (moduleState == null) {
            this.navigateTo('/');
            return;
        }

        if (this.currentPathModule === moduleState) {
            return;
        }

        if (this.currentPathModule) {
            this.unmountModule(this.currentPathModule.options.moduleName)
                .then(
                    () => this.mountModule((moduleState as ModuleState).options.moduleName),
                    () => this.mountModule((moduleState as ModuleState).options.moduleName));
        } else {
            this.mountModule(moduleState.options.moduleName);
        }
    }

    private findModuleByPath(path: string): ModuleState | null {
        let bestMatchLength = 0;
        let bestMatch: ModuleState | null = null;

        for (let moduleName in this.registeredModules) {
            let moduleState = this.registeredModules[moduleName];

            if (moduleState.options.rootPath
                && moduleState.options.rootPath.length > bestMatchLength
                && path.indexOf(moduleState.options.rootPath) === 0) {
                bestMatchLength = moduleState.options.rootPath.length;
                bestMatch = moduleState;
            }
        }

        return bestMatch;
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
        this.audit().auditError('0', `Error while loading module ${moduleState.options.moduleName}.`, err);
        return err;
    }

    private doMount(moduleState: ModuleState): Promise<DynamicModule> {
        if (!moduleState.module || moduleState.state != State.LOADED) {
            throw new Error(`The module ${moduleState.options.moduleName} is not loaded.`);
        }

        if (moduleState.options.rootPath) {
            this.currentPathModule = moduleState;
        }

        moduleState.state = State.MOUNTING;
        moduleState.mountingPromise = moduleState.module.mount(this, moduleState.options).then(
            () => {
                moduleState.state = State.MOUNTED;
                moduleState.mountingPromise = null;
                return moduleState.module;
            },
            (err) => {
                moduleState.state = State.LOADED;
                moduleState.mountingPromise = null;
                this.audit().auditError('0', `Error while mounting module ${moduleState.options.moduleName}.`, err);
                throw err;
            });

        return moduleState.mountingPromise;
    }
}

function loadScript(url, timeout): Promise<HTMLScriptElement> {
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
