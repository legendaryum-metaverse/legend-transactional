/**
 * Different commands related to the "legend-events" microservice.
 */
export const legendEventsCommands = {} as const;
/**
 * Available commands for the "legend-events" microservice.
 */
export type LegendEventsCommands = (typeof legendEventsCommands)[keyof typeof legendEventsCommands];
