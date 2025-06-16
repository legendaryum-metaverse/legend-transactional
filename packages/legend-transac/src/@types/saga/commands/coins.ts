/**
 * Different commands related to the "coins" microservice.
 */
export const coinsCommands = {
  /**
   * Saga step to deduct coins when a user purchase a resource
   */
  DeductCoins: 'resource_purchased:deduct_coins',
  /**
   * Saga step to reward coins to users based on their rankings
   */
  RankingsRewardCoins: 'rankings_users_reward:reward_coins',
} as const;
/**
 * Available commands for the "coins" microservice.
 */
export type CoinsCommands = (typeof coinsCommands)[keyof typeof coinsCommands];
