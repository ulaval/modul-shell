import {Shell, AppEvent, DynamicModule, DynamicModuleOptions} from '../app/shell-ui';

export class LoginModule implements DynamicModule {
    shell: Shell;
    element: HTMLElement;

    constructor(private nextModule) {

    }

    mount(shell: Shell, options: DynamicModuleOptions): Promise<void> {
        this.shell = shell;
        let el = options.rootElement;

        if (!el) {
            throw new Error(`The root element must be specified.`);
        }

        if (typeof el == 'string') {
            const e = document.getElementById(el);
            if (!e) {
                throw new Error(`The element ${el} does not exist.`);
            }

            this.element = e;
        } else {
            this.element = el;
        }

        window['onLogin'] = () => this.onLogin();

        this.element.innerHTML = `
            Login: <input id="userName" type="text"/><br>
            Password: <input id="password" type="password"/><br>
            <button onclick='onLogin()'>Go</button>`;

        return Promise.resolve(undefined);
    }

    unmount(): Promise<void> {
        this.element.innerHTML = '';
        delete window['onLogin'];
        return Promise.resolve(undefined);
    }

    onEvent(event: AppEvent) {
        // Nothing to do
    }

    onLogin() {
        let userName = document.getElementById('userName');
        let pwd = document.getElementById('password');

        if (!userName || userName['value'] != 'fred') {
            alert('Bad username');
            return;
        }

        if (!pwd || pwd['value'] != 'fred') {
            alert('Bad password');
            return;
        }

        this.shell.navigateTo(this.nextModule);
    }
}
