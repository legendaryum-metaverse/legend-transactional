/**
 * Different commands related to the "blockchain" microservice.
 */
export const blockchainCommands = {
} as const;
/**
 * Available commands for the "blockchain" microservice.
 */
export type BlockchainCommands = (typeof blockchainCommands)[keyof typeof blockchainCommands];
