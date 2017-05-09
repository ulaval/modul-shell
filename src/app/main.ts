import {createShell, auditToConsole} from './shell-ui';

console.info('Start');

const identityProvider = () => { throw new Error('Not implemented'); };
const auditMethod = auditToConsole;
const gaProvider = () => { throw new Error('Not implemented'); };

const shell = createShell(identityProvider, auditMethod, gaProvider);

shell.registerModule({
    moduleName: 'mpoAdmission',
    rootElement: 'adm',
    load: 'http://localhost:8095/app.js',
    rootPath: '/admission'
});

shell.mountModule('mpoAdmission').then((res) => console.info(res), (err) => console.warn(err));
