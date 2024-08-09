/**
 * Different commands related to the "social-media-rooms" microservice.
 */
export const socialMediaRoomsCommands = {} as const;
/**
 * Available commands for the "social-media-rooms" microservice.
 */
export type SocialMediaRoomsCommands = (typeof socialMediaRoomsCommands)[keyof typeof socialMediaRoomsCommands];
