/**
 * Different commands related to the "Mint" microservice.
 */
export const mintCommands = {
    /**
     * Command to mint an image.
     */
    MintImage: 'mint_image'
} as const;
/**
 * Available commands for the "Mint" microservice.
 */
export type MintCommands = (typeof mintCommands)[keyof typeof mintCommands];
