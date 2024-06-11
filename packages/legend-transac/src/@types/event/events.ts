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
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Event to cancel a pre-purchase reservation for a resource in room-inventory
     */
    'payments.cancel_pre_purchase_reservation': {
        userId: string;
        resourceId: string;
        reservedQuantity: number;
    };
    /**
     * Websocket event to notify the client about a payment related event.
     */
    'payments.notify_client': {
        room: `payments-${string}`;
        message: Record<string, unknown>;
    };
    /**
     * Event to notify the first saved snapshot of a room.
     */
    'room-snapshot.first_snapshot': {
        slug: string;
    };
    /**
     * Event to block chat between two users.
     */
    'social.block_chat': {
        userId: string;
        userToBlockId: string;
    };
    /**
     * New user in social table in social microservice
     */
    'social.new_user': {
        userId: string;
    };
    /**
     * Event to unblock chat between two users.
     */
    'social.unblock_chat': {
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
    ///////////////////////////
    'PAYMENTS.CANCEL_PRE_PURCHASE_RESERVATION': 'payments.cancel_pre_purchase_reservation',
    'PAYMENTS.NOTIFY_CLIENT': 'payments.notify_client',
    'ROOM_SNAPSHOT.FIRST_SNAPSHOT': 'room-snapshot.first_snapshot',
    'SOCIAL.BLOCK_CHAT': 'social.block_chat',
    'SOCIAL.NEW_USER': 'social.new_user',
    'SOCIAL.UNBLOCK_CHAT': 'social.unblock_chat'
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
