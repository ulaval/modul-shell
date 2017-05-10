import {Identity, AppEvent} from './shell-ui';

export function auditToMpoAudit(urlMpoAudit: string): (event: AppEvent) => void {
    return (event) => {
        const req = new XMLHttpRequest();
        req.open('POST', urlMpoAudit + '/journal', true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        req.send('entree=' + encodeURIComponent(JSON.stringify(mapEventToMpo(event))));
    };
}

export function authenticateWithMpoPortail(url: string, login: string, pwd: string): Promise<Identity> {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('POST', url + '/auth/authentifier/', true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        req.send(`identifiant=${encodeURIComponent(login)}&motpasse=${pwd}`);
        req.onloadend = () => {
            if (req.status >= 200 && req.status <= 210) {
                let identity = mapToIdentity(JSON.parse(req.responseText));
                resolve(identity);
            } else {
                reject('Auth request failed: ' + req.statusText);
            }
        };
    });
}

function mapToIdentity(identite): Identity {
    let token = identite.detailsToken || {};
    let utilisateur = identite.utilisateurMpo || {};

    return {
        authenticated: true,
        currentUserName: token.identifiantUtilisateur,
        token: {
            accessToken: token.token,
            clientId: token.idClient,
            expiration: new Date(token.dateExpiration),
            scope: token.scope,
            tokenType: token.typeToken
        },
        user: {
            system: false, // TODO: Implement system accounts
            userIdsBySystem: {
                mpo: utilisateur.idUtilisateurMpo,
                ena: utilisateur.idUtilisateurEna,
                numeroDossier: utilisateur.numeroDossier,
                set: utilisateur.idDossierIndividuEtudes,
                ni: utilisateur.nie,
                pidm: utilisateur.pidm
            },
            currentAccount: {
                accountType: utilisateur.typeUtilisateurMpo == 'institutionnel' ? 'ul' : 'email',
                userName: utilisateur.identifiant
            },
            accounts: [{
                accountType: utilisateur.typeUtilisateurMpo == 'institutionnel' ? 'ul' : 'email',
                userName: utilisateur.identifiant
            }],
            givenName: utilisateur.prenom,
            familyName: utilisateur.nom,
            primaryEmailAdress: utilisateur.courrielPrincipal,
            gender: utilisateur.sexe ? (utilisateur.sexe == 'MASCULIN' ? 'male' : 'female') : undefined,
            suspended: utilisateur.suspendu,
            changeNumber: utilisateur.numeroChangement,
            userPreferences: {
                pseudonym: utilisateur.pseudonyme,
                lang: utilisateur.languePreferee && utilisateur.languePreferee.toLowerCase(),
                colorBlind: utilisateur.daltonien as boolean
            },
            active: !utilisateur.suspendu,
            accesses: [] // TODO: Implement accesses
        }
    };
}

function mapEventToMpo(event: AppEvent): any {
    let entree: any = {
        typeEntree: event.eventType,
        codeAcces: event.userName
    };

    switch (event.eventType) {
    case('js'):
        entree.url = event.url;
        entree.identifiantErreur = event.eventId;
        entree.msg = event.msg;
        entree.erreur = JSON.parse(JSON.stringify(event.err, ['message', 'arguments', 'type', 'name', 'stack']));
        break;
    case('nav'):
        entree.urlSource = event.srcUrl;
        entree.urlDestination = event.destUrl;
        break;
    case('rest'):
        entree.identifiantErreur = event.eventId;
        entree.requeteUrl = event.url;
        entree.requeteMethode = event.method;
        entree.requeteParametres = event.params;
        entree.reponseStatut = event.statusCode;
        entree.reponseData = event.data;
        break;
    default:
        entree = {
            ...entree,
            ...event.params
        };
    }

    return entree;
}
