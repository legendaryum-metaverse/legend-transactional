/**
 * Different commands related to the "room-inventory" microservice.
 */
export const roomInventoryCommands = {
    /**
     * Command to decrease the available quantity of a resource during the purchase process.
     */
    DecreaseAvailableQuantity: 'resource_purchased:decrease_available_quantity'
} as const;
/**
 * Available commands for the "room-inventory" microservice.
 */
export type RoomInventoryCommands = (typeof roomInventoryCommands)[keyof typeof roomInventoryCommands];
