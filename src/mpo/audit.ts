// import { Shell, AuditService } from '../shell';

// export function createMpoAuditService(urlMpoAudit: string): (shell) => AuditService {
//     return (shell) => new MpoAuditService(shell, urlMpoAudit);
// }

// class MpoAuditService implements AuditService {
//     constructor(private shell: Shell, private urlMpoAudit) {

//     }

//     auditError(msg: string, err: any) {
//         let params = {
//             url: window.location.href,
//             identifianErreur: generateId(),
//             msg: msg,
//             erreur: JSON.parse(JSON.stringify(err, ['message', 'arguments', 'type', 'name', 'stack']))
//         };

//         this.audit('js', params);
//     }

//     auditNavigation(srcUrl: string, destUrl: string) {
//         let params = {
//             urlSource: srcUrl,
//             urlDestination: destUrl
//         };

//         this.audit('nav', params);
//     }

//     auditRestError(errorId: string, url: string, method: string, params: any, statusCode: number, data?: any) {
//         let eParams = {
//             identifiantErreur: errorId,
//             requeteUrl: url,
//             requeteMethode: method,
//             requeteParametres: params,
//             reponseStatut: statusCode,
//             reponseData: data
//         };

//         this.audit('rest', eParams);
//     }

//     audit(eventType, params): void {
//         this.shell.identity().identity().then(identity => {
//             let event = {
//                 typeEntree: eventType,
//                 ...params
//             };

//             if (identity && identity.currentAccount) {
//                 event.codeAcces = identity.currentAccount.userName;
//             }

//             const req = new XMLHttpRequest();
//             req.open('POST', this.urlMpoAudit + '/journal', true);
//             req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
//             req.send('entree=' + encodeURIComponent(JSON.stringify(event)));
//         });
//     }
// }

// function generateId() {
//     return Math.random().toString(36).substring(2, 15);
// }
