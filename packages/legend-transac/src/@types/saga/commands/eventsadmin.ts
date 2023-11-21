/**
 * Different commands related to the "events-admin" microservice.
 */
export const eventsAdminCommands = {
    /**
     * Command to generate an event ticket.
     */
    GenerateEventTicket: 'generate_event_ticket',
    /**
     * Command to update the stock of a product.
     */
    UpdateProductStock: 'stock:product:update',
    /**
     * Command to emit a payment confirmation.
     */
    EmitPaymentConfirmation: 'emit_payment:confirmation',
    /**
     * Command to send an email with the products.
     */
    SendEmailProducts: 'products:send:email',
    /**
     * Command to update the remaining of a virtual product.
     */
    UpdateVirtualProductRemaining: 'update:virtual-product:remaining',
    /**
     * Command to unlock a virtual product for a user.
     */
    UnlockVirtualProductUser: 'unlock:virtual-product:user'
} as const;
/**
 * Available commands for the "events-admin" microservice.
 */
export type EventsAdminCommands = (typeof eventsAdminCommands)[keyof typeof eventsAdminCommands];
