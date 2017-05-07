
export interface Shell {
    // Module management
    registerModule(moduleOptions: ModuleOptions);
    registerModules(modulesOptions: [ModuleOptions]);
    preloadModule(moduleName: string);
    mountModule(moduleName: string, el: Element | string);
    unmountModule(moduleName: string);

    // Inter-module Routing
    navigateTo(pathName: string);

    // Inter-module communication
    emit(message: string | Message, params?: any);

    // Security
    currentIdentity(): Identity;

    // Audit
    auditNavigation(event: NavigationEvent);
    auditAction(event: ActionEvent);
    auditError(event: ErrorEvent);

    // Analytics
    ga(): UniversalAnalytics.ga;
}

export interface Message {
    msgName: string;
    params: any;
}

export interface ErrorEvent {
    idError: string;
    url: string;
    error: Error;
}

export interface ActionEvent {
    action: string;
    [params: string]: string;
}

export interface NavigationEvent {
    srcUrl: string;
    destUrl: string;
}

export interface Identity {
    authenticated: boolean;
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    emailAdress: string;
    avatarUrl: string;
    expiration: Date;
    token: string;
    attributes: [SecurityAttribute];
}

export interface SecurityAttribute {
    src: string;
    name: string;
    value: string;
}

export interface Module {
    mount(shell: Shell): Promise<void>;
    unmount(): Promise<void>;
    onEvent(event: Message);
}

export interface ModuleOptions {
    moduleName: string;
    rootPath: string;
    scriptSrc: string;
}
