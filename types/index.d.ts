
declare module "@ulaval/shell-ui" {
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
        preloadModule(moduleName: string): Promise<DynamicModule>;

        /**
         * Activates the module, if the module is not loaded, it will be.
         */
        mountModule(moduleName: string): Promise<DynamicModule>;

        /**
         * Puts a module back in the loaded state.
         */
        unmountModule(moduleName: string): Promise<DynamicModule>;

        /**
         * Allows access to the current user.
         */
        identity(): Promise<Identity>;

        /**
         * Allows a module to give control to another module.
         */
        navigateTo(pathName: string);

        /**
         * Emits an event for other modules to consume.
         */
        emit(event: string | AppEvent, params?: any);

        /**
         * Audits an event. For example, an application error.
         */
        audit(event: string | AppEvent, params?: any);

        /**
         * Gives access to the google analytics instance.
         */
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
        mount(shell: Shell): Promise<void>;

        /**
         * Takes a mounted modules and puts it back into the loaded state.
         */
        unmount(): Promise<void>;

        /**
         * Receives events emitted through the Shell.emit() method.
         */
        onEvent(event: AppEvent);
    }

    /**
     * Applicative event.
     */
    export interface AppEvent {
        eventType: string;
        params?: { [key: string]: any; };
    }

    export interface Identity {
        /**
         * If the current user is authenticated.
         */
        authenticated: boolean;

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
        userIdsBySystem: {[systeme: string]: string};

        /**
         * A user can have multiple accounts.
         *
         * For example, a Google and Facebook accounts.
         */
        accounts: [Account];

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
        accesses: [Access];

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
        colorBlind: boolean;

        /**
         * Timezone to display date/times.
         */
        timezone: string;
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
        load: ((options: DynamicModuleOptions)=>Promise<DynamicModule>) | string;

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
        rootElement?: Element | string;

        /**
         * Optional parameters to pass to the module while mounting the module.
         */
        params?: {[key: string]: any};
    }
}
