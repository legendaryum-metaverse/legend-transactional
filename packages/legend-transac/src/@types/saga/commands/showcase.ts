/**
 * Different commands related to the "legend-showcase" microservice.
 */
export const showcaseCommands = {} as const;
/**
 * Available commands for the "legend-showcase" microservice.
 */
export type ShowcaseCommands = (typeof showcaseCommands)[keyof typeof showcaseCommands];
