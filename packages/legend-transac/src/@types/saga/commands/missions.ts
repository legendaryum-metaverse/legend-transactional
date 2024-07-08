/**
 * Different commands related to the "legend-missions" microservice.
 */
export const missionsCommands = {} as const;
/**
 * Available commands for the "legend-missions" microservice.
 */
export type MissionsCommands = (typeof missionsCommands)[keyof typeof missionsCommands];
