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
    EmitPaymentConfirmation: 'emit_payment:confirmation'
} as const;
/**
 * Available commands for the "events-admin" microservice.
 */
export type EventsAdminCommandsCommands = (typeof eventsAdminCommands)[keyof typeof eventsAdminCommands];
