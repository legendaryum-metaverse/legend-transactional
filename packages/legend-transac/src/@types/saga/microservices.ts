/**
 * Represents the available microservices in the system.
 */
export const availableMicroservices = {
    /**
     * Represents the "Image" microservice.
     */
    Image: 'image',
    /**
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
     * Represents the "liptv" microservice.
     */
    Social: 'social',
    /**
     * Represents the "liptv" microservice.
     */
    Pagos: 'pagosv2'
} as const;
/**
 * Type of available microservices in the system.
 */
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
