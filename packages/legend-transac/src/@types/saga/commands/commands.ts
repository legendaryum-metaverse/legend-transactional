import { TestImageCommands } from './image';
import { TestMintCommands } from './mint';
import { SocialCommands } from './social';
import { PaymentCommands } from './payments';
import { RoomCreatorCommands } from './roomCreator';
import { AuthCommands } from './auth';
import { ShowcaseCommands } from './showcase';
import { StorageCommands } from './storage';
import { RoomSnapshotCommands } from './room-snapshot';
import { AvailableMicroservices, availableMicroservices } from '../../microservices';
import { RoomInventoryCommands } from './room-inventory';
import { RapidMessagingCommands } from './rapid-messaging';
import { MissionsCommands } from './missions';
import { SocialMediaRoomsCommands } from './social-media-rooms';
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
     * Represents the mapping of "auth" microservice commands.
     */
    [availableMicroservices.Auth]: AuthCommands;
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
    /**
     * Represents the mapping of "room-snapshot" microservice commands.
     */
    [availableMicroservices.RoomSnapshot]: RoomSnapshotCommands;
    /**
     * Represents the mapping of "room-inventory" microservice commands.
     */
    [availableMicroservices.RoomInventory]: RoomInventoryCommands;
    /**
     * Represents the mapping of "rapid-messaging" microservice commands.
     */
    [availableMicroservices.RapidMessaging]: RapidMessagingCommands;
    /**
     * Represents the mapping of "legend-missions" microservice commands.
     */
    [availableMicroservices.Missions]: MissionsCommands;
    /**
     * Represents the mapping of "social-media-rooms" microservice commands.
     */
    [availableMicroservices.SocialMediaRooms]: SocialMediaRoomsCommands;
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
