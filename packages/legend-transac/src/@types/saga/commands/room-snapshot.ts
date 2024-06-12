/**
 * Different commands related to the "room-snapshot" microservice.
 */
export const roomSnapshotCommands = {} as const;
/**
 * Available commands for the "room-snapshot" microservice.
 */
export type RoomSnapshotCommands = (typeof roomSnapshotCommands)[keyof typeof roomSnapshotCommands];
