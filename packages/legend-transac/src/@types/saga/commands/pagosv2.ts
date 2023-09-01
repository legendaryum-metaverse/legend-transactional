/**
 * Different commands related to the "pagosv2" microservice.
 */
export const paymentCommands = {
    /**
     * Command to mint an image.
     */
    MakeAPurchase: 'make_a_purchase'
} as const;
/**
 * Available commands for the "Mint" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
