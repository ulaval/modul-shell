import * as Audit from './audit';
import * as Identity from './identity';

export default {
    createMpoAuditService: Audit.createMpoAuditService,
    authenticateWithMpoPortail: Identity.authenticateWithMpoPortail
};
