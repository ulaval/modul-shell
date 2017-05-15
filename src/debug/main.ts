import { createShell } from '../shell';
import {LoginPackage, createDummyGaService, createLocalStorageIdentityService} from '../dev';
import {createMpoAuditService} from '../mpo';
// import identity from '../mpo/identity';

const identityService = createLocalStorageIdentityService('/login', '/login');
const auditService = createMpoAuditService('https://audit.monportail.test.ulaval.ca/audit/v1');
const gaService = createDummyGaService();

const shell = createShell(identityService, auditService, gaService);

shell.registerPackages([{
    packageName: 'login',
    rootElement: 'log',
    load: () => Promise.resolve(new LoginPackage()),
    rootPath: '/login'
},
{
    packageName: 'mpoAdmission',
    rootElement: 'adm',
    load: 'http://localhost:8095/app.js',
    rootPath: '/'
}]);

shell.start();
