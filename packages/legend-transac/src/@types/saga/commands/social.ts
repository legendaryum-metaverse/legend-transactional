/**
 * Different commands related to the "social" microservice.
 */
export const socialCommands = {
  /**
   * Command to create a new social user.
   */
  CreateSocialUser: 'create_social_user',
  /**
   * Command to update the social user's image.
   */
  UpdateUserImage: 'update_user:image',
} as const;
/**
 * Available commands for the "social" microservice.
 */
export type SocialCommands = (typeof socialCommands)[keyof typeof socialCommands];
