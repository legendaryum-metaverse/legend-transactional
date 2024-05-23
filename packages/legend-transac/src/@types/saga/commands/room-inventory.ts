/**
 * Different commands related to the "room-inventory" microservice.
 */
export const roomInventoryCommands = {} as const;
/**
 * Available commands for the "room-inventory" microservice.
 */
export type RoomInventoryCommands = (typeof roomInventoryCommands)[keyof typeof roomInventoryCommands];
