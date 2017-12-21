/// <reference types="google.analytics" />
/**
 * Creates a shell to handle a multi-package application.
 *
 * @param identityServiceFactory The factory to create an identity service
 * @param auditServiceFactory The factory to create an audit service
 * @param analyticsServiceFactory  The factory to create an analytics service
 */
export declare const createShell: (identityServiceFactory: (shell: Shell) => IdentityService, auditServiceFactory: (shell: Shell) => AuditService, analyticsServiceFactory: (shell: Shell) => AnalyticsService) => Shell;
/**
 * Interface to cummunicate with the shell.
 */
export interface Shell {
    /**
     * Register a new package so that it can be loaded and mounted.
     */
    registerPackage(packageOptions: PackageOptions): any;
    /**
     * Register a series of new packages so that they can be loaded and mounted.
     */
    registerPackages(packagesOptions: [PackageOptions]): any;
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
    start(cloak?: boolean): any;
    uncloak(): void;
    /**
     * Allows to navigate between packages.
     */
    navigateTo(pathName: string): any;
    /**
     * Emits an event for other packages to consume.
     */
    emit(eventType: string, params?: any): any;
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
    loadScript(url: any, timeout: any): Promise<HTMLScriptElement>;
    /**
     * Dependency injection?
     */
    getPackage(packageName: string): Package | undefined;
    /**
     * Injector?
     */
    package(packageName: string, inlineConstructor: any[]): any;
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
    auditError(errorId: string, msg: string, err: any): any;
    /**
     * Audits a web navigation.
     */
    auditNavigation(srcUrl: string, destUrl: string): any;
    /**
     * Audits an error while invoking a rest service.
     */
    auditRestError(errorId: string, url: string, method: string, params: any, statusCode: number, data?: any): any;
    /**
     * Audit a generic event.
     */
    audit(eventId: string, eventType: string, params?: any): any;
}
export interface AnalyticsService {
    ga(): Promise<UniversalAnalytics.ga>;
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
    onEvent(eventType: string, params?: any): any;
}
export interface Identity {
    /**
     * If the current user is authenticated.
     */
    authenticated: boolean;
    /**
     * The user's account used to open the current session.
     */
    currentAccount: Account;
    /**
     * The user if authenticated.
     */
    user?: User;
    /**
     * Token to use for invoking secured services.
     */
    token?: Token;
    /**
     * Extra proprietary attributes.
     */
    attributes: any;
}
export interface User {
    /**
     * If the current user is a system.
     */
    system: boolean;
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
    userIdsBySystem: {
        [systeme: string]: string;
    };
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
     * If the user is not authenticated, the account type is 'anonymous'.
     */
    accountType: 'anonymous' | 'email' | 'google' | 'facebook' | 'ul' | string;
    /**
     * The user name or email adress.
     */
    userName: 'anonymous' | string;
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
    params?: {
        [key: string]: any;
    };
    /**
     * TODO: package always mounted, no matter the current package mounted for the selected path
     * TODO: or should be asked to be mounted by a another package, and remain mounted if already there...
     */
    forceLoad?: boolean;
    /**
     * For chunk loading, will set the __webpack_public_path__ var.
     */
    repoPublicPath?: string;
    /**
     * Packages loaded before the application starts
     */
    guard?: boolean;
}
