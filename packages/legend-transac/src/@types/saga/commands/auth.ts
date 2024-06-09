/**
 * Different commands related to the "auth" microservice.
 */
export const authCommands = {} as const;
/**
 * Available commands for the "auth" microservice.
 */
export type AuthCommands = (typeof authCommands)[keyof typeof authCommands];
