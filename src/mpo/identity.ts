import {Identity} from '../app/shell-ui';

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
