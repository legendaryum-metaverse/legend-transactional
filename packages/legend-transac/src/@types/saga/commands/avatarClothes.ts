/**
 * Different commands related to the "legend-avatar-clothes" microservice.
 */
export const avatarClothesCommands = {
    /**
     * Command to add a new clothes to a user.
     */
    AddClothesUser: 'add:clothes:user',
    /**
     * Command to request the unlocking of clothes.
     */
    RequestUnlockRpm: 'request:unlock:rpm'
} as const;
/**
 * Available commands for the "legend-avatar-clothes" microservice.
 */
export type AvatarClothesCommands = (typeof avatarClothesCommands)[keyof typeof avatarClothesCommands];
