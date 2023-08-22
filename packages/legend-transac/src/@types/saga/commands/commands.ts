import { ImageCommands } from './image';
import { MintCommands } from './mint';
import { AvailableMicroservices, availableMicroservices } from '../microservices';
import { LipTVCommands } from './liptv';
import { NotificacionesCommands } from './notificaciones';
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
    /**
     * Represents the mapping of "liptv" microservice commands.
     */
    [availableMicroservices.LipTV]: LipTVCommands;
    /**
     * Represents the mapping of "notificaciones" microservice commands.
     */
    [availableMicroservices.Notificaciones]: NotificacionesCommands;
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
