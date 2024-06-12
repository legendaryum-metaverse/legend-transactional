/**
 * Different commands related to the "room-inventory" microservice.
 */
export const roomInventoryCommands = {
    /**
     * Command to save a purchased resource on user inventory
     */
    SavePurchasedResource: 'resource_purchased:save_purchased_resource'
} as const;
/**
 * Available commands for the "room-inventory" microservice.
 */
export type RoomInventoryCommands = (typeof roomInventoryCommands)[keyof typeof roomInventoryCommands];
