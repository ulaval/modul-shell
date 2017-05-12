import { Shell, AnalyticsService, Identity, IdentityService } from '../app/shell-ui';

export const auditToConsole = function(eventType: string, params?: any) {
    console.warn(`${eventType}: ${JSON.stringify(params || 'no args')}`);
};

export function createLocalStorageIdentityService(loginUrl: string = '/login', logoutUrl: string = '/logout', key: string = 'identity'): (shell: Shell) => IdentityService {
    return (shell) => new LocalStorageIdentityService(shell, key, loginUrl, logoutUrl);
}

export function createDummyGaService(): (shell) => AnalyticsService {
    return (shell) => new DummyGaService();
}

export default {
    auditToConsole,
    createLocalStorageIdentityService,
    createDummyGaService
};

class DummyGaService implements AnalyticsService {
    ga(): Promise<UniversalAnalytics.ga> {
        return Promise.reject(new Error('Not implemented'));
    }
}

class LocalStorageIdentityService implements IdentityService {
    currentIdentity: Identity;

    constructor(private shell: Shell, private key, private loginUrl: string, private logoutUrl: string) {
        this.currentIdentity = this.load();
    }

    updateIdentity(identity: Identity): void {
        localStorage.setItem(this.key, JSON.stringify(identity));
        this.currentIdentity = identity;
    }

    identity(): Promise<Identity> {
        return Promise.resolve(this.currentIdentity);
    }

    requireAuthenticatedIdentity(): Promise<Identity> {
        return this.identity()
            .then(identity => {
                if (identity.authenticated) {
                    return identity;
                }
                this.shell.navigateTo(`${this.loginUrl}?ret=${encodeURIComponent(window.location.pathname)}`);
                throw new Error ('Not authenticated.');
            },
            err => {
                this.shell.navigateTo(this.loginUrl);
                throw err;
            });
    }

    logout(): void {
        localStorage.removeItem(this.key);
        this.currentIdentity = this.load();
        this.shell.navigateTo(this.logoutUrl);
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
