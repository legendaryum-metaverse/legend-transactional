/**
 * Represents the available event's payload in the system.
 */
export interface EventPayload {
    /**
     * Test purpose
     *
     * Event broadcast by the "Image" test microservice.
     * @internal
     */
    'test.image': {
        image: string;
    };
    /**
     * Test purpose
     *
     * Event broadcast by the "Mint" test microservice.
     * @internal
     */
    'test.mint': {
        mint: string;
    };
    /**
     * Event broadcast by the "New User" social microservice.
     */
    'social.new_user': {
        userId: string;
    };
    /**
     * Event broadcast by the "Notify Client" payments microservice.
     */
    'payments.notify_client': {
        room: string;
        message: Record<string, unknown>;
    };
}
/**
 * Represents the available events in the system.
 */
export const microserviceEvent = {
    'TEST.IMAGE': 'test.image',
    'TEST.MINT': 'test.mint',
    'SOCIAL.NEW_USER': 'social.new_user',
    'PAYMENTS.NOTIFY_CLIENT' : 'payments.notify_client'
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
