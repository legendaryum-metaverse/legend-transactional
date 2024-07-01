/**
 * Different commands related to the "legend-showcase" microservice.
 */
export const showcaseCommands = {
    /**
     * Command to update the product virtual and randomize the pv-image related.
     */
    randomize_island_pv_image: 'randomize_island_pv_image'
} as const;
/**
 * Available commands for the "legend-showcase" microservice.
 */
export type ShowcaseCommands = (typeof showcaseCommands)[keyof typeof showcaseCommands];
