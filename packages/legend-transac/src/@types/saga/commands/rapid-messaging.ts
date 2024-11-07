/**
 * Different commands related to the "rapid-messaging" microservice.
 */
export const rapidMessagingCommands = {
    /**
     * Command to replicate minimal information of the social user once it is created.
     */
    ReplicateMinimizedSocialUser: 'replicate_minimized_social_user'
} as const;
/**
 * Available commands for the "rapid-messaging" microservice.
 */
export type RapidMessagingCommands = (typeof rapidMessagingCommands)[keyof typeof rapidMessagingCommands];
