import {createShell} from './shell-ui';
import {auditToMpoAudit} from './ul-integration';

console.info('Start');

let identityJson = localStorage.getItem('identity');
let identity;

if (identityJson) {
    identity = JSON.parse(identityJson);
} else {
    identity = {
        authenticated: false
    };
}

const identityProvider = () => Promise.resolve(identity);
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
