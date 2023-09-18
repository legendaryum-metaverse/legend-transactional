/**
 * Different commands related to the "pagosv2" microservice.
 */
export const paymentCommands = {
    /**
     * Command to make a purchase.
     */
    MakeAPurchase: 'make_a_purchase',
    /**
     * Command to mint images and create NFTs.
     */
    MintImages: 'mint_images',
    /**
     * Command to get the owner NFTs filtered by IPFS hashes. 'get_owner_nfts:filter:ipfsHashes'
     */
    GetOwnerNFTsFilterIPFSHashes: 'get_owner_nfts:filter:ipfsHashes'
} as const;
/**
 * Available commands for the "pagosv2" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
