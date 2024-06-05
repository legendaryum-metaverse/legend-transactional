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
     * Represents the "auth" microservice.
     */
    Auth: 'auth',
    /**
     * Represents the "legend-analytics" microservice.
     */
    Analytics: 'legend-analytics',
    /**
     * Represents the "legend-avatar-clothes" microservice.
     */
    AvatarClothes: 'legend-avatar-clothes',
    /**
     * Represents the "events-admin" microservice.
     */
    EventsAdmin: 'events-admin',
    /**
     * Represents the "legend-integrations" microservice.
     */
    Integrations: 'legend-integrations',
    /**
     * Represents the "notificaciones" microservice.
     */
    Notifications: 'notificaciones',
    /**
     * Represents the "payments" microservice.
     */
    Payments: 'payments',
    /**
     * Represents the "room-creator" microservice.
     */
    RoomCreator: 'room-creator',
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
    /**
     * Represents the "room-snapshot" microservice.
     */
    RoomSnapshot: 'room-snapshot',
    /**
     * Represents the "room-inventory" microservice.
     */
    RoomInventory: 'room-inventory',
    /**
     * Represents the "rapid-messaging" microservice.
     */
    RapidMessaging: 'rapid-messaging'
} as const;
/**
 * Type of available microservices in the system.
 */
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
