import { Shell, AnalyticsService, Identity, IdentityService, AuditService } from '../shell';

export const createConsoleAuditServiceFactory = function(): (shell) => AuditService {
    return (shell) => new ConsoleAuditService();
};

export function createLocalStorageIdentityServiceFactory(loginUrl: string = '/login', logoutUrl: string = '/logout', key: string = 'identity'): (shell: Shell) => IdentityService {
    return (shell) => new LocalStorageIdentityService(shell, key, loginUrl, logoutUrl);
}

export function createDummyAnalyticsServiceFactory(): (shell) => AnalyticsService {
    return (shell) => new DummyAnalyticsService();
}

class ConsoleAuditService implements AuditService {
    auditError(errorId: string, msg: string, err: any) {
        this.audit(errorId, 'err', {msg, err});
    }

    auditNavigation(srcUrl: string, destUrl: string) {
        this.audit('0', 'nav', {srcUrl, destUrl});
    }

    auditRestError(errorId: string, url: string, method: string, params: any, statusCode: number, data?: any) {
        this.audit(errorId, 'rest', {url, method, params, statusCode, data});
    }

    audit(eventId: string, eventType: string, params?: any) {
        console.info({eventId, eventType, params});
    }
}

class DummyAnalyticsService implements AnalyticsService {
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
                currentAccount: {
                    accountType: 'anonymous',
                    userName: 'anonymous'
                },
                attributes: {}
            };
        }
    }
}
