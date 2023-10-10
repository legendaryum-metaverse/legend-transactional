/**
 * Different commands related to the "legend-analytics" microservice.
 */
export const analyticsCommands = {
    /**
     * Command to persist a successful purchase.
     */
    PersistsProducts: 'persists_products'
} as const;
/**
 * Available commands for the "legend-analytics" microservice.
 */
export type AnalyticsCommands = (typeof analyticsCommands)[keyof typeof analyticsCommands];
