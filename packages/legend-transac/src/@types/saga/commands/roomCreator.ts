/**
 * Different commands related to the "room-creator" microservice.
 */
export const roomCreatorCommands = {} as const;
/**
 * Available commands for the "room-creator" microservice.
 */
export type RoomCreatorCommands = (typeof roomCreatorCommands)[keyof typeof roomCreatorCommands];
