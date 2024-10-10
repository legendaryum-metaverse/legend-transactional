/**
 * Different commands related to the "rankings" microservice.
 */
export const rankingsCommands = {} as const;
/**
 * Available commands for the "rankings" microservice.
 */
export type RankingsCommands = (typeof rankingsCommands)[keyof typeof rankingsCommands];
