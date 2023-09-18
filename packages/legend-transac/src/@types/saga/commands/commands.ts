import { ImageCommands } from './image';
import { MintCommands } from './mint';
import { AvailableMicroservices, availableMicroservices } from '../microservices';
import { LipTVCommands } from './liptv';
import { SocialCommands } from './social';
import { PaymentCommands } from './pagosv2';
import { NotificationCommands } from './notifications';
import { IntegrationCommands } from './integrations';
/**
 * A map that defines the relationship between microservices and their corresponding commands.
 */
export interface CommandMap {
    /**
     * Test purpose
     * Represents the mapping of "Image" microservice commands.
     */
    [availableMicroservices.Image]: ImageCommands;
    /**
     * Test purpose
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
    [availableMicroservices.Notifications]: NotificationCommands;
    /**
     * Represents the mapping of "social" microservice commands.
     */
    [availableMicroservices.Social]: SocialCommands;
    /**
     * Represents the mapping of "pagosv2" microservice commands.
     */
    [availableMicroservices.Payments]: PaymentCommands;
    /**
     * Represents the mapping of "legend-integrations" microservice commands.
     */
    [availableMicroservices.Integrations]: IntegrationCommands;
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
