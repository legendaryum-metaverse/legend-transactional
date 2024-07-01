/**
 * Different commands related to the "room-creator" microservice.
 */
export const roomCreatorCommands = {
    /**
     * Command to update the room template.
     */
    update_room_template: 'update_room_template'
} as const;
/**
 * Available commands for the "room-creator" microservice.
 */
export type RoomCreatorCommands = (typeof roomCreatorCommands)[keyof typeof roomCreatorCommands];
