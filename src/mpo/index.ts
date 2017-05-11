import * as Audit from './audit';
import * as Identity from './identity';

export default {
    createMpoAuditProvider: Audit.createMpoAuditProvider,
    authenticateWithMpoPortail: Identity.authenticateWithMpoPortail
};
