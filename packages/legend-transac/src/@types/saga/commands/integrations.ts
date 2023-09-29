/**
 * Different commands related to the "legend-integrations" microservice.
 */
export const integrationCommands = {
    /**
     * Command to emit NFTs generated to the client from "legend-integrations".
     */
    EmitNft: 'emit_nft',
    /**
     * Command to emit cancel sale of NFT
     */
    EmitNftCancelSale: 'emit_nft:cancel_sale',
    /**
     * Command to emit NFT on sale
     */
    EmitNftOnSale: 'emit_nft:on_sale',
    /**
     * Command to generate images using OpenAI.
     */
    GenerateImages: 'generate_images:openai',
    /**
     * Command to save new generated nft image to internal storage.
     */
    PersistsNft: 'persists_nft',
    /**
     * Command to persist the cancel sale of the NFT.
     */
    PersistsNftCancelSale: 'persists_nft:cancel_sale',
    /**
     * Command to persist the NFT on sale.
     */
    PersistsNftOnSale: 'persists_nft:put_nft_on_sale',
    /**
     * Command to upload images to cloud storage.
     */
    UploadImages: 'upload_images:cloudstorage'
} as const;
/**
 * Available commands for the "legend-integrations" microservice.
 */
export type IntegrationCommands = (typeof integrationCommands)[keyof typeof integrationCommands];
