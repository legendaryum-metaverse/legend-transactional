/**
 * Different commands related to the "social-media-rooms" microservice.
 */
export const socialMediaRoomsCommands = {} as const;
/**
 * Available commands for the "social-media-rooms" microservice.
 */
export type SocialMediaRoomsCommandsCommands = (typeof socialMediaRoomsCommands)[keyof typeof socialMediaRoomsCommands];
