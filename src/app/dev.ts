import { Identity, IdentityProvider, AppEvent } from './shell-ui';

export const auditToConsole = function(event: AppEvent) {
    console.warn(event);
};

export function createLocalStorageIdentityProvider(key: string = 'identity'): IdentityProvider {
    return new LocalStorageIdentityProvider(key);
}

class LocalStorageIdentityProvider implements IdentityProvider {
    cur: Promise<Identity>;

    constructor(private key) {
        this.cur = Promise.resolve(this.load());
    }

    identity(): Promise<Identity> {
        return this.cur;
    }

    logout(): void {
        localStorage.removeItem(this.key);
        this.cur = Promise.resolve(this.load());
    }

    private load(): Identity {
        let identityJson = localStorage.getItem(this.key);

        if (identityJson) {
            return JSON.parse(identityJson);
        } else {
            return {
                authenticated: false,
                currentUserName: 'anonymous'
            };
        }
    }
}
