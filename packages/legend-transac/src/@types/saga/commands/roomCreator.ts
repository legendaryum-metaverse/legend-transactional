/**
 * Different commands related to the "room-creator" microservice.
 */
export const roomCreatorCommands = {
    /**
     * Command to create rooms for a new user.
     */
    CreateMyRoomsToNewUser: 'new_user:create_my_rooms'
} as const;
/**
 * Available commands for the "room-creator" microservice.
 */
export type RoomCreatorCommands = (typeof roomCreatorCommands)[keyof typeof roomCreatorCommands];
