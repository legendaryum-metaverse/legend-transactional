/**
 * Different commands related to the "Image" microservice.
 */
export const testImageCommands = {
    /**
     * Command to create an image.
     */
    CreateImage: 'create_image',
    /**
     * Command to update a token for an image.
     */
    UpdateToken: 'update_token'
} as const;
/**
 * Available commands for the "Image" microservice.
 */
export type TestImageCommands = (typeof testImageCommands)[keyof typeof testImageCommands];
