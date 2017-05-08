import {Shell, DynamicModule, DynamicModuleOptions, Identity, AppEvent} from "@ulaval/shell-ui"

export class ShellImpl implements Shell {

    registerModule(moduleOptions: DynamicModuleOptions) {
        return Promise.reject(new Error("Not implemented"));
    }

    registerModules(modulesOptions: [DynamicModuleOptions]) {
        for (let i=0; i < modulesOptions.length; ++i) {
            this.registerModule(modulesOptions[i]);
        }
    }

    preloadModule(moduleName: string): Promise<DynamicModule> {
        return Promise.reject(new Error("Not implemented"));
    }

    mountModule(moduleName: string): Promise<DynamicModule> {
        return Promise.reject(new Error("Not implemented"));
    }

    unmountModule(moduleName: string): Promise<DynamicModule> {
        return Promise.reject(new Error("Not implemented"));
    }

    // Inter-module Routing
    navigateTo(pathName: string) {

    }

    // Inter-module communication
    emit(message: string | AppEvent, params?: any) {

    }

    // Security
    identity(): Promise<Identity> {
        return Promise.reject(new Error("Not implemented"));
    }

    // Audit
    audit(event: AppEvent) {
        throw new Error("Not implemented");
    }

    // Analytics
    ga(): Promise<UniversalAnalytics.ga> {
        return Promise.reject(new Error("Not implemented"));
    }
}