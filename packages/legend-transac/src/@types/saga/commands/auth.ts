/**
 * Different commands related to the "auth" microservice.
 */
export const authCommands = {
    /**
     * Command to update the user's picture, use to delete the base64 image from the user.
     */
    UpdateUserPicture: 'update_user:picture'
} as const;
/**
 * Available commands for the "auth" microservice.
 */
export type AuthCommands = (typeof authCommands)[keyof typeof authCommands];
