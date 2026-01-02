import { TestImageCommands } from './image';
import { TestMintCommands } from './mint';
import { SocialCommands } from './social';
import { AuthCommands } from './auth';
import { ShowcaseCommands } from './showcase';
import { StorageCommands } from './storage';
import { AvailableMicroservices, availableMicroservices } from '../../microservices';
import { MissionsCommands } from './missions';
import { SendEmailCommands } from './send-email';
import { RankingsCommands } from './rankings';
import { BlockchainCommands } from './blockchain';
import { AuditEdaCommands } from './audit-eda';
import { TransactionalCommands } from './transactional';
import { BillingCommands } from './billing';
/**
 * A map that defines the relationship between microservices and their corresponding commands.
 */
export interface CommandMap {
  /**
   * Represents the mapping of "legend-billing" microservice commands.
   */
  [availableMicroservices.Billing]: BillingCommands;
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
   * Represents the mapping of "audit-eda" microservice commands.
   */
  [availableMicroservices.AuditEda]: AuditEdaCommands;
  /**
   * Represents the mapping of "blockchain" microservice commands.
   */
  [availableMicroservices.Blockchain]: BlockchainCommands;
  /**
   * Represents the mapping of "legend-missions" microservice commands.
   */
  [availableMicroservices.Missions]: MissionsCommands;
  /**
   * Represents the mapping of "rankings" microservice commands.
   */
  [availableMicroservices.Rankings]: RankingsCommands;
  /**
   * Represents the mapping of "legend-send-email" microservice commands.
   */
  [availableMicroservices.SendEmail]: SendEmailCommands;
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
   * Represents the mapping of "transactional" microservice commands.
   */
  [availableMicroservices.Transactional]: TransactionalCommands;
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
