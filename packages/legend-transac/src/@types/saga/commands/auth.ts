/**
 * Different commands related to the "auth" microservice.
 */
export const authCommands = {
    /**
     * Command to create a new user.
     */
    CreateUser: 'create_user'
} as const;
/**
 * Available commands for the "auth" microservice.
 */
export type AuthCommands = (typeof authCommands)[keyof typeof authCommands];
