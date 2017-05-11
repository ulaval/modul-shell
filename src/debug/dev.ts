import { GaProvider, Identity, IdentityProvider, AppEvent } from '../app/shell-ui';

export const auditToConsole = function(event: AppEvent) {
    console.warn(event);
};

export function createLocalStorageIdentityProvider(key: string = 'identity'): IdentityProvider {
    return new LocalStorageIdentityProvider(key);
}

export function createDummyGaProvider(): GaProvider {
    return new DummyGaProvider();
}

export default {
    auditToConsole,
    createLocalStorageIdentityProvider,
    createDummyGaProvider
};

class DummyGaProvider implements GaProvider {
    ga(): Promise<UniversalAnalytics.ga> {
        return Promise.reject(new Error('Not implemented'));
    }
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
