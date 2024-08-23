/**
 * Different commands related to the "coins" microservice.
 */
export const coinsCommands = {
    /**
     * Saga used to deduct coins when a user purchase a resource
     */
    DeductCoins: 'resource_purchased:deduct_coins'
} as const;
/**
 * Available commands for the "coins" microservice.
 */
export type CoinsCommands = (typeof coinsCommands)[keyof typeof coinsCommands];
