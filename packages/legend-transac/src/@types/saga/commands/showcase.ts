/**
 * Different commands related to the "legend-showcase" microservice.
 */
export const showcaseCommands = {
    /**
     * Command to update the product virtual information.
     */
    update_product_virtual: 'update_product_virtual'
} as const;
/**
 * Available commands for the "legend-showcase" microservice.
 */
export type ShowcaseCommands = (typeof showcaseCommands)[keyof typeof showcaseCommands];
