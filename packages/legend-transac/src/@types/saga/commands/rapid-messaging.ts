/**
 * Different commands related to the "rapid-messaging" microservice.
 */
export const rapidMessagingCommands = {} as const;
/**
 * Available commands for the "rapid-messaging" microservice.
 */
export type RapidMessagingCommands = (typeof rapidMessagingCommands)[keyof typeof rapidMessagingCommands];
