import {AuditProvider, AppEvent} from '../app/shell-ui';

export function createMpoAuditProvider(urlMpoAudit: string): AuditProvider {
    return new MpoAuditProvider(urlMpoAudit);
}

class MpoAuditProvider implements AuditProvider {
    constructor(private urlMpoAudit) {

    }

    audit(event: AppEvent): void {
        const req = new XMLHttpRequest();
        req.open('POST', this.urlMpoAudit + '/journal', true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        req.send('entree=' + encodeURIComponent(JSON.stringify(mapEventToMpo(event))));
    }
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
