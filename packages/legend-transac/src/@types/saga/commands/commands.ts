import { TestImageCommands } from './image';
import { TestMintCommands } from './mint';
import { SocialCommands } from './social';
import { PaymentCommands } from './payments';
import { NotificationCommands } from './notifications';
import { IntegrationCommands } from './integrations';
import { AnalyticsCommands } from './analytics';
import { EventsAdminCommands } from './eventsadmin';
import { AvatarClothesCommands } from './avatarClothes';
import { RoomCreatorCommands } from './roomCreator';
import { AuthCommands } from './auth';
import { ShowcaseCommands } from './showcase';
import { StorageCommands } from './storage';
import { AvailableMicroservices, availableMicroservices } from '../../microservices';
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
     * Represents the mapping of "auth" microservice commands.
     */
    [availableMicroservices.Auth]: AuthCommands;
    /**
     * Represents the mapping of "legend-avatar-clothes" microservice commands.
     */
    [availableMicroservices.AvatarClothes]: AvatarClothesCommands;
    /**
     * Represents the mapping of "events-admin" microservice commands.
     */
    [availableMicroservices.EventsAdmin]: EventsAdminCommands;
    /**
     * Represents the mapping of "legend-integrations" microservice commands.
     */
    [availableMicroservices.Integrations]: IntegrationCommands;
    /**
     * Represents the mapping of "notificaciones" microservice commands.
     */
    [availableMicroservices.Notifications]: NotificationCommands;
    /**
     * Represents the mapping of "payments" microservice commands.
     */
    [availableMicroservices.Payments]: PaymentCommands;
    /**
     * Represents the mapping of "room-creator" microservice commands.
     */
    [availableMicroservices.RoomCreator]: RoomCreatorCommands;
    /**
     * Represents the mapping of "social" microservice commands.
     */
    [availableMicroservices.Showcase]: ShowcaseCommands;
    /**
     * Represents the mapping of "social" microservice commands.
     */
    [availableMicroservices.Social]: SocialCommands;
    /**
     * Represents the mapping of "legend-storage" microservice commands.
     */
    [availableMicroservices.Storage]: StorageCommands;
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
