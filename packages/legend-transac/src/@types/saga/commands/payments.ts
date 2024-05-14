/**
 * Different commands related to the "payments" microservice.
 */
export const paymentCommands = {
    /**
     * Saga used to add coins when a user is created for the first time.
     */
    UserCreationReward: 'new_user:creation_reward'
} as const;
/**
 * Available commands for the "payments" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
