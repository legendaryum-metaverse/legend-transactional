/**
 * Different commands related to the "blockchain" microservice.
 */
export const blockchainCommands = {
    /**
     * Saga step to make transfers to winners.
     */
    TransferRewardToWinners: 'crypto_reward:transfer_reward_to_winners'
} as const;
/**
 * Available commands for the "blockchain" microservice.
 */
export type BlockchainCommands = (typeof blockchainCommands)[keyof typeof blockchainCommands];
