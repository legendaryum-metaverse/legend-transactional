/**
 * Represents the available microservices in the system.
 * The names are taken from the repository names in GitHub: https://github.com/orgs/legendaryum-metaverse/repositories?type=all
 */
export const availableMicroservices = {
    /**
     * Test purpose
     * Represents the "Image" test microservice.
     */
    Image: 'image',
    /**
     * Test purpose
     * Represents the "Mint" test microservice.
     */
    Mint: 'mint',
    /**
     * Represents the "notificaciones" microservice.
     */
    Notifications: 'notificaciones',
    /**
     * Represents the "liptv" microservice.
     */
    LipTV: 'liptv',
    /**
     * Represents the "social" microservice.
     */
    Social: 'social',
    /**
     * Represents the "pagosv2" microservice.
     */
    Payments: 'pagosv2',
    /**
     * Represents the "legend-integrations" microservice.
     */
    Integrations: 'legend-integrations'
} as const;
/**
 * Type of available microservices in the system.
 */
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
