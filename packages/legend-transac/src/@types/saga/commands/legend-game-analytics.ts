/**
 * Different commands related to the "legend-game-analytics" microservice.
 */
export const legendGameAnalyticsCommands = {} as const;
/**
 * Available commands for the "legend-game-analytics" microservice.
 */
export type LegendGameAnalyticsCommands = (typeof legendGameAnalyticsCommands)[keyof typeof legendGameAnalyticsCommands];
