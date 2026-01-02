/**
 * Different commands related to the "billing" microservice.
 */
export const billingCommands = {
    RefundPayment: 'refund_payment',
    CancelSubscription: 'cancel_subscription',
    CreateSubscriptionSchedule: 'create_subscription_schedule',
} as const;

/**
 * Available commands for the "billing" microservice.
 */
export type BillingCommands = (typeof billingCommands)[keyof typeof billingCommands];
