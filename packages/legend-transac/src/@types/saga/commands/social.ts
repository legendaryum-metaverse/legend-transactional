/**
 * Different commands related to the "social" microservice.
 */
export const socialCommands = {
    /**
     * Command to assign a virtual product to a user.
     */
    AssignVirtualProductUser: 'assign:virtual-product:user',
    /**
     * Command to listen of the payment's status.
     */
    PaymentStatus: 'payment_status'
} as const;
/**
 * Available commands for the "social" microservice.
 */
export type SocialCommands = (typeof socialCommands)[keyof typeof socialCommands];
