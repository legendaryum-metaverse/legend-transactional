/**
 * Represents the available microservices in the system.
 */
export const availableMicroservices = {
    /**
     * Test purpose
     * Represents the "Image" microservice.
     */
    Image: 'image',
    /**
     * Test purpose
     * Represents the "Mint" microservice.
     */
    Mint: 'mint',
    /**
     * Represents the "notificaciones" microservice.
     */
    Notificaciones: 'notificaciones',
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
    Pagos: 'pagosv2'
} as const;
/**
 * Type of available microservices in the system.
 */
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
