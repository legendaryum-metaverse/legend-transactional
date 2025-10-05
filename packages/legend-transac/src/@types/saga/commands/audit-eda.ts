/**
 * Different commands related to the "audit-eda" microservice.
 */
export const auditEdaCommands = {} as const;
/**
 * Available commands for the "audit-eda" microservice.
 */
export type AuditEdaCommands = (typeof auditEdaCommands)[keyof typeof auditEdaCommands];
