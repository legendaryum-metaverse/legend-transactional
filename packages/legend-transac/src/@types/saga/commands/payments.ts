/**
 * Different commands related to the "payments" microservice.
 */
export const paymentCommands = {
    /**
     * Saga used to deduct coins when a user purchase a resource
     */
    DeductCoins: 'resource_purchased:deduct_coins',
    /**
     * Saga used finalize the purchase flow by removing the key from Redis
     */
    RemoveRedisKey: 'resource_purchased:remove_redis_key'
} as const;
/**
 * Available commands for the "payments" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
