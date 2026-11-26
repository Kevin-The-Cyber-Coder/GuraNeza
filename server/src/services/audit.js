import AuditLog from '../models/AuditLog.js';

/**
 * Records an audit entry. Audit failures must never break the main operation,
 * so errors are logged and swallowed.
 */
export const recordAudit = async ({
  req,
  actor,
  action,
  entityType,
  entityId,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor: actor || req?.user?._id,
      action,
      entityType,
      entityId,
      metadata,
      ip: req?.ip || '',
      userAgent: req?.get?.('user-agent') || '',
    });
  } catch (error) {
    console.error(`[audit] Failed to record ${action}: ${error.message}`);
  }
};

export default recordAudit;
