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
     * New user in social table in social microservice
     */
    'social.new_user': {
        userId: string;
    };
    /**
     * Websocket event to notify the client about a payment related event.
     */
    'payments.notify_client': {
        room: `payments-${string}`;
        message: Record<string, unknown>;
    };
    /**
     * Event to block chat between two users.
     */
    'blockChat': {
        userId: string;
        userToBlockId: string;
    };
    /**
     * Event to unblock chat between two users.
     */
    'unblockChat': {
        userId: string;
        userToUnblockId: string;
    };
}
/**
 * Represents the available events in the system.
 */
export const microserviceEvent = {
    'TEST.IMAGE': 'test.image',
    'TEST.MINT': 'test.mint',
    'SOCIAL.NEW_USER': 'social.new_user',
    'PAYMENTS.NOTIFY_CLIENT': 'payments.notify_client',
    'BLOCK_CHAT': 'blockChat',
    'UNBLOCK_CHAT': 'unblockChat'
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
