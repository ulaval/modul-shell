// import { createShell, Package, Shell } from '../shell';
// import { LoginPackage, createDummyAnalyticsServiceFactory, createLocalStorageIdentityServiceFactory } from '../dev';
// import { createMpoAuditService/*, authenticateWithMpoPortail*/ } from '../mpo';
// // import { CadrePackage } from '../cadre/cadre';
// // import { SecurityPackage } from '../security/security';
// // import identity from '../mpo/identity';

// const identityService = createLocalStorageIdentityServiceFactory('/login', '/login');
// const auditService = createMpoAuditService('https://audit.monportail.test.ulaval.ca/audit/v1');
// const gaService = createDummyAnalyticsServiceFactory();

// const shell = createShell(identityService, auditService, gaService);
// // needed for external components (ex: mpo-cadre)
// window['shell'] = shell;

// class RootPackage implements Package {
//     mount(shell: Shell, options): Promise<void> {
//         // (document.getElementById('nav') as HTMLButtonElement).addEventListener('click', this.nav);

//         return Promise.resolve(undefined);
//     }

//     unmount(): Promise<void> {
//         // (document.getElementById('nav') as HTMLButtonElement).removeEventListener('click', this.nav);
//         return Promise.resolve(undefined);
//     }

//     onEvent(eventType: string, params?: any) {
//         // Empty
//     }

//     nav(): void {
//         window['shell'].navigateTo('/admission');
//     }
// }

// // shell.package('sec', [SecurityPackage]);
// // shell.package('sec', ['dep1', 'dep2', SecurityPackage]);

// shell.registerPackages([
//     {
//         packageName: 'securite',
//         load: 'https://localhost:62001/public/modules/shell/securite/securite.js',
//         guard: true
//     },
//     {
//         packageName: 'mpo-cadre',
//         load: 'https://localhost:62001/public/modules/shell/mpo-cadre/cadre.js',
//         forceLoad: true
//     },
//     {
//         packageName: 'root',
//         rootElement: 'main',
//         load: () => Promise.resolve(new RootPackage()),
//         rootPath: '/'
//     },
//     {
//         packageName: 'login',
//         rootElement: 'log',
//         // load: () => Promise.resolve(new LoginPackage((userName, pwd) => authenticateWithMpoPortail('https://monportail.testpr.ulaval.ca', userName, pwd))),
//         load: () => Promise.resolve(new LoginPackage()),
//         rootPath: '/login'
//     },
//     {
//         packageName: 'mpoAdmission',
//         rootElement: 'ael',
//         load: 'https://localhost:62001/public/modules/ael/app.js',
//         rootPath: '/admission',
//         repoPublicPath: '/public/modules/ael/'
//     },
//     {
//         packageName: 'mpoReleveNotes',
//         rootElement: 'mporelevenotes',
//         load: 'https://localhost:62001/public/modules/relevenotes/app.js',
//         rootPath: '/relevenotes',
//         repoPublicPath: '/public/modules/relevenotes/'
//     }]);

// shell.start(true);
