/**
 * Represents the available microservices in the system.
 * The names are taken from the repository names in GitHub: https://github.com/orgs/legendaryum-metaverse/repositories?type=all
 */
export const availableMicroservices = {
  /**
   * Test purpose
   * Represents the "Image" test microservice.
   */
  TestImage: 'test-image',
  /**
   * Test purpose
   * Represents the "Mint" test microservice.
   */
  TestMint: 'test-mint',
  /**
   * Represents the "audit-eda" microservice for event-driven architecture auditing.
   * This microservice consumes audit events (audit.received, audit.processed, audit.dead_letter)
   * to track event lifecycle and debugging purposes.
   */
  AuditEda: 'audit-eda',
  /**
   * Represents the "auth" microservice.
   */
  Auth: 'auth',
  /**
   * Represents the "legend-billing" microservice.
   * Handles payment processing, subscriptions, and billing domain events.
   */
  Billing: 'billing',
  /**
   * Represents the "blockchain" microservice.
   */
  Blockchain: 'blockchain',
  /**
   * Represents the "legend-missions" microservice.
   */
  Missions: 'legend-missions',
  /**
   * Represents the "rankings" microservice.
   */
  Rankings: 'rankings',
  /**
   * Represents the "legend-events" microservice.
   */
  Events: 'legend-events',
  /**
   * Represents the "transactional" microservice.
   */
  Transactional: 'transactional',
  /**
   * Represents the "legend-send-email" microservice.
   */
  SendEmail: 'legend-send-email',
  /**
   * Represents the "legend-showcase" microservice.
   */
  Showcase: 'legend-showcase',
  /**
   * Represents the "social" microservice.
   */
  Social: 'social',
  /**
   * Represents the "legend-storage" microservice.
   */
  Storage: 'legend-storage',
} as const;
/**
 * Type of available microservices in the system.
 */
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
