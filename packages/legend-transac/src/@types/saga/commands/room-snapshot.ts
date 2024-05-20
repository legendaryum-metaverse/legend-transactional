/**
 * Different commands related to the "room-snapshot" microservice.
 */
export const roomSnapshotCommands = {
    /**
     * Command to save a purchased resource on user inventory
     */
    PurchaseResource: 'resource_purchased:save_purchased_resource'
} as const;
/**
 * Available commands for the "room-snapshot" microservice.
 */
export type RoomSnapshotCommands = (typeof roomSnapshotCommands)[keyof typeof roomSnapshotCommands];
