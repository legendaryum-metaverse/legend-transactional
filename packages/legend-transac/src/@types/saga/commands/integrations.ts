/**
 * Different commands related to the "legend-integrations" microservice.
 */
export const integrationCommands = {
    /**
     * Command to generate images using OpenAI.
     */
    GenerateImages: 'generate_images:openai',
    /**
     * Command to upload images to cloud storage.
     */
    UploadImages: 'upload_images:cloudstorage',
    /**
     * Command to save images to internal storage.
     */
    PersistsNft: 'persists_nft',
    /**
     * Command to emit NFTs to the client from "legend-integrations".
     */
    EmitNft: 'emit_nft'
} as const;
/**
 * Available commands for the "legend-integrations" microservice.
 */
export type IntegrationCommands = (typeof integrationCommands)[keyof typeof integrationCommands];
