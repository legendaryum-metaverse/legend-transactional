/**
 * Different commands related to the "Mint" microservice.
 */
export const testMintCommands = {
  /**
   * Command to mint an image.
   */
  MintImage: 'mint_image',
} as const;
/**
 * Available commands for the "Mint" microservice.
 */
export type TestMintCommands = (typeof testMintCommands)[keyof typeof testMintCommands];
