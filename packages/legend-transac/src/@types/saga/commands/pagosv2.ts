/**
 * Different commands related to the "pagosv2" microservice.
 */
export const paymentCommands = {
    /**
     * Command to make a purchase.
     */
    MakeAPurchase: 'make_a_purchase'
} as const;
/**
 * Available commands for the "pagosv2" microservice.
 */
export type PaymentCommands = (typeof paymentCommands)[keyof typeof paymentCommands];
