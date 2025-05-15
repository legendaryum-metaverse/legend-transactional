/**
 * Different commands related to the "blockchain" microservice.
 */
export const blockchainCommands = {
    /**
     * Saga step to make transfers to winners.
     */
    TransferRewardToWinners: 'crypto_reward:transfer_reward_to_winners',
    /**
     * Saga step to transfer crypto reward to the winner of a mission.
     */
    TransferMissionRewardToWinner: 'crypto_reward:transfer_mission_reward_to_winner'
} as const;
/**
 * Available commands for the "blockchain" microservice.
 */
export type BlockchainCommands = (typeof blockchainCommands)[keyof typeof blockchainCommands];
