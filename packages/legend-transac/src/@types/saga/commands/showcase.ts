/**
 * Different commands related to the "legend-showcase" microservice.
 */
export const showcaseCommands = {
    /**
     * Command to add virtual products to a new user.
     */
    AddVirtualProductsToNewUser: 'new_user:add_virtual_products'
} as const;
/**
 * Available commands for the "legend-showcase" microservice.
 */
export type ShowcaseCommands = (typeof showcaseCommands)[keyof typeof showcaseCommands];
