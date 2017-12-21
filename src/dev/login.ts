// import { Shell, Package, PackageOptions, Identity } from '../shell';

// export class LoginPackage implements Package {
//     shell: Shell;
//     element: HTMLElement;

//     constructor(private loginMethod?: (login: string, pwd: string) => Promise<Identity>) {

//     }

//     mount(shell: Shell, options: PackageOptions): Promise<void> {
//         this.shell = shell;
//         let el = options.rootElement;

//         if (!el) {
//             throw new Error(`The root element must be specified.`);
//         }

//         if (typeof el == 'string') {
//             const e = document.getElementById(el);
//             if (!e) {
//                 throw new Error(`The element ${el} does not exist.`);
//             }

//             this.element = e;
//         } else {
//             this.element = el;
//         }

//         window['onLogin'] = () => this.onLogin();

//         this.element.innerHTML = `
//             Login: <input id="userName" type="text"/><br>
//             Password: <input id="password" type="password"/><br>
//             <button onclick='onLogin()'>Go</button>`;

//         return Promise.resolve(undefined);
//     }

//     unmount(): Promise<void> {
//         this.element.innerHTML = '';
//         delete window['onLogin'];
//         return Promise.resolve(undefined);
//     }

//     onEvent(eventType, params) {
//         // Nothing to do
//     }

//     onLogin() {
//         let userName = document.getElementById('userName') || '';
//         let pwd = document.getElementById('password') || '';

//         const loginMethod = this.loginMethod ? this.loginMethod : defaultLoginMethod;

//         loginMethod(userName['value'], pwd['value'])
//             .then((identity) => {
//                 this.shell.identity().updateIdentity(identity);
//                 let res = /ret=([^&]+)/.exec(window.location.search);
//                 let url = res ? decodeURIComponent(res[1]) : '/';
//                 this.shell.navigateTo(url);
//             });
//     }
// }

// function defaultLoginMethod(userName, pwd): Promise<Identity> {
//     if (userName != 'fred') {
//         return Promise.reject('Bad user or password.');
//     }

//     if (pwd != 'fred') {
//         return Promise.reject('Bad user or password.');
//     }

//     return Promise.resolve({
//         authenticated: true,
//         currentAccount: {
//             accountType: 'dummy',
//             userName: userName
//         },
//         user: {
//             active: true,
//             suspended: false,
//             system: false,
//             userPreferences: {
//                 lang: 'fr'
//             },
//             userIdsBySystem: {},
//             accounts: [{
//                 accountType: 'dummy',
//                 userName: userName
//             }],
//             primaryEmailAdress: userName + '@ulaval.ca',
//             accesses: [],
//             changeNumber: 0
//         },
//         attributes: {}
//     });
// }
