import { createShell, Package, Shell, PackageOptions } from '../shell';

window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, erreur?: Error) => {
    console.error('shell unhandled', message);
};

const shell = createShell();

class RootPackage implements Package {
    mount(shell: Shell, options): Promise<void> {
        window.setTimeout(() => {
            shell.navigateTo('/msgs');
        }, 100);

        return Promise.resolve(undefined);
    }

    unmount(): Promise<void> {
        return Promise.resolve(undefined);
    }

    onEvent(eventType: string, params?: any) {
        // Empty
    }
}

class MessagesPackage implements Package {
    private element: HTMLElement;
    private shell: Shell;

    mount(shell: Shell, options: PackageOptions): Promise<void> {
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

        window['onNavTo'] = page => this.navTo(page);

        this.element.innerHTML =
            `<h1>Message</h1><p>This is a message</p>
            <button onclick="onNavTo('/another')">Another page</button><br/>
            <button onclick="onNavTo('/invalid')">Invalid page</button>`;

        return Promise.resolve();
    }

    navTo(page: string): void {
        this.shell.navigateTo(page);
    }

    unmount(): Promise<void> {
        // (this as any).a.a = '';
        this.element.innerHTML = '';
        delete window['onNavTo'];
        return Promise.resolve();
    }

    onEvent(eventType: string, params?: any) {
        // Empty
    }
}

class AnotherPackage implements Package {
    private element: HTMLElement;

    mount(shell: Shell, options: PackageOptions): Promise<void> {
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

        this.element.innerHTML = '<h1>Another page</h1><p>This is another page</p>';

        return Promise.resolve();
    }

    unmount(): Promise<void> {
        this.element.innerHTML = '';
        return Promise.resolve();
    }

    onEvent(eventType: string, params?: any) {
        // Empty
    }
}

shell.registerPackages([
    {
        packageName: 'root',
        rootElement: 'main',
        load: () => Promise.resolve(new RootPackage()),
        rootPath: '/root'
    },
    {
        packageName: 'msgs',
        rootElement: 'msgs',
        load: () => { /*this['d'].d = 's'; */return Promise.resolve(new MessagesPackage()); },
        rootPath: '/msgs'
    },
    {
        packageName: 'another',
        rootElement: 'another',
        load: () => Promise.resolve(new AnotherPackage()),
        rootPath: '/another'
    }
]);

shell.start();
