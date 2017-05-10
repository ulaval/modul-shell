import {createShell} from './shell-ui';
import {createLocalStorageIdentityProvider} from './dev';
import {auditToMpoAudit, authenticateWithMpoPortail} from './ul-integration';

console.info('Start');

const identityProvider = createLocalStorageIdentityProvider();
const auditMethod = auditToMpoAudit('https://audit.monportail.test.ulaval.ca/audit/v1');
const gaProvider = () => Promise.reject(new Error('Not implemented'));

const shell = createShell(identityProvider, auditMethod, gaProvider);

shell.registerModule({
    moduleName: 'mpoAdmission',
    rootElement: 'adm',
    load: 'http://localhost:8095/app.js',
    rootPath: '/admission'
});

shell.mountModule('mpoAdmission').then((res) => console.info(res), (err) => console.warn(err));

shell.auditError('A bad thing happened.', new Error('Oh la la'));

authenticateWithMpoPortail('https://monportail.testpr.ulaval.ca', 'adsy1', '')
    .then(res => console.info(res));
