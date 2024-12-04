/**
 * Different commands related to the "rankings" microservice.
 */
export const rankingsCommands = {
    /**
     * Command to initiate a crypto transfer for ranking winners.
     */
    TransferRewardToWinners: 'transfer_reward_to_winners'
} as const;
/**
 * Available commands for the "rankings" microservice.
 */
export type RankingsCommands = (typeof rankingsCommands)[keyof typeof rankingsCommands];
