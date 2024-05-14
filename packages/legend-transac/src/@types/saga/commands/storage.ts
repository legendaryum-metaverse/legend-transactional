/**
 * Different commands related to the "legend-storage" microservice.
 */
export const storageCommands = {
    /**
     * Command to store a file from base64.
     */
    UpdateFile: 'update_file'
} as const;
/**
 * Available commands for the "legend-showcase" microservice.
 */
export type StorageCommands = (typeof storageCommands)[keyof typeof storageCommands];
