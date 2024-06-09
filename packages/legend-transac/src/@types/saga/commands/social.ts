/**
 * Different commands related to the "social" microservice.
 */
export const socialCommands = {
    /**
     * Command to update the social user's image.
     */
    UpdateUserImage: 'update_user:image',
    /**
     * Command to notify the client with websocket.
     */
    NotifyClient: 'notify_client'
} as const;
/**
 * Available commands for the "social" microservice.
 */
export type SocialCommands = (typeof socialCommands)[keyof typeof socialCommands];
