import type { AuditLogEntry } from '../types/domain'

export const appendAuditEntry = (
  action: string,
  resourceType: string,
  resourceId: string,
  status: AuditLogEntry['status'],
  details: string,
): void => {
  // Audit data is backend-owned; admin screens read it from admin-service.
  void action
  void resourceType
  void resourceId
  void status
  void details
}
