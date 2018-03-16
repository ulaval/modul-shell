import { createShell, Package, Shell, PackageOptions } from '../shell';

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

        this.element.innerHTML = '<h1>Message</h1><p>This is a message</p>';

        return Promise.resolve(undefined);
    }

    unmount(): Promise<void> {
        return Promise.resolve(undefined);
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
        rootPath: '/'
    },
    {
        packageName: 'msgs',
        rootElement: 'msgs',
        load: () => Promise.resolve(new MessagesPackage()),
        rootPath: '/msgs'
    }
]);

shell.start();
