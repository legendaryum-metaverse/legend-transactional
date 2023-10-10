import { TestImageCommands } from './image';
import { TestMintCommands } from './mint';
import { AvailableMicroservices, availableMicroservices } from '../microservices';
import { LipTVCommands } from './liptv';
import { SocialCommands } from './social';
import { PaymentCommands } from './pagosv2';
import { NotificationCommands } from './notifications';
import { IntegrationCommands } from './integrations';
import { AnalyticsCommands } from './analytics';
import { EventsAdminCommandsCommands } from './eventsadmin';
/**
 * A map that defines the relationship between microservices and their corresponding commands.
 */
export interface CommandMap {
    /**
     * Test purpose
     * Represents the mapping of "Image" microservice commands.
     */
    [availableMicroservices.TestImage]: TestImageCommands;
    /**
     * Test purpose
     * Represents the mapping of "Mint" microservice commands.
     */
    [availableMicroservices.TestMint]: TestMintCommands;
    /**
     * Represents the mapping of "legend-analytics" microservice commands.
     */
    [availableMicroservices.Analytics]: AnalyticsCommands;
    /**
     * Represents the mapping of "events-admin" microservice commands.
     */
    [availableMicroservices.EventsAdmin]: EventsAdminCommandsCommands;
    /**
     * Represents the mapping of "legend-integrations" microservice commands.
     */
    [availableMicroservices.Integrations]: IntegrationCommands;
    /**
     * Represents the mapping of "liptv" microservice commands.
     */
    [availableMicroservices.LipTV]: LipTVCommands;
    /**
     * Represents the mapping of "notificaciones" microservice commands.
     */
    [availableMicroservices.Notifications]: NotificationCommands;
    /**
     * Represents the mapping of "pagosv2" microservice commands.
     */
    [availableMicroservices.Payments]: PaymentCommands;
    /**
     * Represents the mapping of "social" microservice commands.
     */
    [availableMicroservices.Social]: SocialCommands;
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
