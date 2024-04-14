/**
 * Different commands related to the "auth" microservice.
 */
export const authCommands = {
    /**
     * Command to create roles to rooms for a new user.
     */
    CreateRolesToNewUserRooms: 'new_user:set_roles_to_rooms'
} as const;
/**
 * Available commands for the "auth" microservice.
 */
export type AuthCommands = (typeof authCommands)[keyof typeof authCommands];
