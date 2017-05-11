import { createShell } from '../app/shell-ui';
import {LoginModule} from './login';
import dev from './dev';
import mpo from '../mpo';

const identityProvider = dev.createLocalStorageIdentityProvider();
const auditMethod = mpo.createMpoAuditProvider('https://audit.monportail.test.ulaval.ca/audit/v1');
const gaProvider = dev.createDummyGaProvider();

const shell = createShell(identityProvider, auditMethod, gaProvider);

shell.registerModules([{
    moduleName: 'login',
    rootElement: 'log',
    load: () => Promise.resolve(new LoginModule('/admission')),
    rootPath: '/login'
},
{
    moduleName: 'mpoAdmission',
    rootElement: 'adm',
    load: 'http://localhost:8095/app.js',
    rootPath: '/admission'
}]);

shell.navigateTo('/login');

// shell.auditError('A bad thing happened.', new Error('Oh la la'));

// mpo.authenticateWithMpoPortail('https://monportail.testpr.ulaval.ca', 'adsy1', '').then(res => console.info(res));
