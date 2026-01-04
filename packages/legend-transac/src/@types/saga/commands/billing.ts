/**
 * Different commands related to the "billing" microservice.
 */
export const billingCommands = {} as const;

/**
 * Available commands for the "billing" microservice.
 */
export type BillingCommands = (typeof billingCommands)[keyof typeof billingCommands];
