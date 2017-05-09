import './shell-ui';
import Shell from '@ulaval/shell-ui';

console.info('Start');

const identityProvider = () => { throw new Error('Not implemented'); };
const auditMethod = () => { throw new Error('Not implemented'); };
const gaProvider = () => { throw new Error('Not implemented'); };

const shell = Shell.createShell(identityProvider, auditMethod, gaProvider);

shell.registerModule({
    moduleName: 'test',
    rootElement: 'test',
    load: 'http://localhost:8095',
    rootPath: '/'
});

shell.mountModule('test');
