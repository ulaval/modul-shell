import {createShell, Package} from '../shell';
import {LoginPackage, createDummyAnalyticsServiceFactory, createLocalStorageIdentityServiceFactory} from '../dev';
import {createMpoAuditService} from '../mpo';
// import identity from '../mpo/identity';

const identityService = createLocalStorageIdentityServiceFactory('/login', '/login');
const auditService = createMpoAuditService('https://audit.monportail.test.ulaval.ca/audit/v1');
const gaService = createDummyAnalyticsServiceFactory();

const shell = createShell(identityService, auditService, gaService);

class RootPackage implements Package {
    mount(shell, options): Promise<void> {
        window.setTimeout(() => {
            shell.navigateTo('/msgs');
        }, 0);

        return Promise.resolve(undefined);
    }

    unmount(): Promise<void> {
        return Promise.resolve(undefined);
    }

    onEvent(eventType: string, params?: any) {
        // Empty
    }
}

shell.registerPackages([{
    packageName: 'root',
    load: () => Promise.resolve(new RootPackage()),
    rootPath: '/'
},
{
    packageName: 'login',
    rootElement: 'log',
    load: () => Promise.resolve(new LoginPackage()),
    rootPath: '/login'
},
{
    packageName: 'mpoAdmission',
    rootElement: 'adm',
    load: 'http://localhost:8095/app.js',
    rootPath: '/admission'
},
{
    packageName: 'mpoMessagesImportants',
    rootElement: 'msgs',
    load: 'http://localhost:8090/app.js',
    rootPath: '/msgs'
}]);

shell.start();
