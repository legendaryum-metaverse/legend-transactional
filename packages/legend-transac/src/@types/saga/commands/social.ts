/**
 * Different commands related to the "social" microservice.
 */
export const socialCommands = {
    /**
     * Command to assign a virtual product to a user.
     * @deprecated
     */
    AssignVirtualProductUser: 'assign:virtual-product:user',
    /**
     * Command to listen of the payment's status.
     * @deprecated
     */
    PaymentStatus: 'payment_status',
    /**
     * Command to create a new user.
     */
    CreateNewUser: 'new_user:create',
    /**
     * Command to add rooms to a new user.
     */
    AddRoomsToNewUser: 'new_user:add_rooms',
    /**
     * Command to update the social user's image.
     */
    UpdateUserImage: 'update_user:image'
} as const;
/**
 * Available commands for the "social" microservice.
 */
export type SocialCommands = (typeof socialCommands)[keyof typeof socialCommands];
