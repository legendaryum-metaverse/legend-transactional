/**
 * Different commands related to the "Social" microservice.
 */
export const socialCommands = {
    /**
     * Command to listen of the payment's status.
     */
    PaymentStatus: 'payment_status'
} as const;
/**
 * Available commands for the "Mint" microservice.
 */
export type SocialCommands = (typeof socialCommands)[keyof typeof socialCommands];
