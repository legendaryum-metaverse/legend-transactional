/**
 * Different commands related to the "pagosv2" microservice.
 */
export const paymentCommands = {
    /**
     * Command to put an NFT on sale. First an approval is required to transfer the NFT to the marketplace.
     */
    ApproveNftToMarketplace: 'approve_nft_to_marketplace',
    /**
     * Command to cancel the sale of an NFT. Returns the NFT to the owner.
     */
    CancelSale: 'cancel_sale',
    /**
     * Command to get the blockchain user with userId mongo id.
     */
    GetBlockchainUser: 'get_blockchain_user',
    /**
     * Command to get the owner NFTs filtered by IPFS hashes. 'get_owner_nfts:filter:ipfsHashes'
     */
    GetOwnerNFTsFilterIPFSHashes: 'get_owner_nfts:filter:ipfsHashes',
    /**
     * Command to make a purchase.
     */
    MakeAPurchase: 'make_a_purchase',
    /**
     * Command to mint images and create NFTs.
     */
    MintImages: 'mint_images',
    /**
     * Command to persist a balance recharge.
     */
    PersistRecharge: 'persist_recharge',
    /**
     * Command to put an NFT on sale.
     */
    PutNftOnSale: 'put_nft_on_sale',
    /**
     * Command to recharge the balance of a user.
     */
    TransferEth: 'transfer_eth'
} as const;
/**
 * Available commands for the "pagosv2" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
