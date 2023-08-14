import { AvailableMicroservices, availableMicroservices } from './microservices';
/**
 * Different commands related to the "Image" microservice.
 */
export const imageCommands = {
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
export type ImageCommands = (typeof imageCommands)[keyof typeof imageCommands];
/**
 * Different commands related to the "Mint" microservice.
 */
export const mintCommands = {
    /**
     * Command to mint an image.
     */
    MintImage: 'mint_image'
} as const;
/**
 * Available commands for the "Mint" microservice.
 */
export type MintCommands = (typeof mintCommands)[keyof typeof mintCommands];
/**
 * A map that defines the relationship between microservices and their corresponding commands.
 */
export interface CommandMap {
    /**
     * Represents the mapping of "Image" microservice commands.
     */
    [availableMicroservices.Image]: ImageCommands;
    /**
     * Represents the mapping of "Mint" microservice commands.
     */
    [availableMicroservices.Mint]: MintCommands;
}
/**
 * Represents a command specific to a microservice.
 * T - The type of microservice for which the command is intended.
 * @template T
 */
export interface MicroserviceCommand<T extends AvailableMicroservices> {
    /**
     * The specific command associated with the microservice.
     */
    command: CommandMap[T];
    /**
     * The microservice to which the command belongs.
     */
    microservice: T;
}
