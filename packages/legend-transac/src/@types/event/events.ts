/**
 * Types of rooms
 */
export const RoomTypes = {
    ISLAND: 'island',
    HOUSE: 'house',
    HALL_OF_FAME: 'hallOfFame'
} as const;

/**
 * Type of RoomTypes
 */
export type RoomType = (typeof RoomTypes)[keyof typeof RoomTypes];

/**
 * Room in Room Creator
 */
export interface Room {
    Id: string;
    CreateAt: string;
    UpdateAt: string;
    type: RoomType;
    name: string;
    ownerId: string;
    ownerEmail: string;
    maxPlayers: number;
    maxLayers: number;
    templateId: string;
    haveEditor: boolean;
}

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
     * Event to notify the deletion of a user.
     */
    'auth.deleted_user': {
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
     * Event to notify the creation of a room.
     */
    'room_creator.created_room': {
        room: Room;
    };
    /**
     * Event emitted when a room is updated.
     */
    'room_creator.updated_room': {
        room: Room;
    };
    /**
     * Event emitted when a user updates a room template
     */
    'room_inventory.update_room_template': {
        roomId: string;
        images: string[];
    };
    /**
     * Event emitted when the image of a virtual product's building is updated
     */
    'room_inventory.update_vp_building_image': {
        images: string[];
        roomType: string;
        userId: string;
    };
    /**
     * Event emitted when a user changes buildings within the island
     */
    'room_snapshot.building_change_in_island': {
        userId: string;
        building: string;
    };
    /**
     * Event to notify the first saved snapshot of a room.
     */
    'room_snapshot.first_snapshot': {
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
    'AUTH.DELETED_USER': 'auth.deleted_user',
    'PAYMENTS.NOTIFY_CLIENT': 'payments.notify_client',
    'ROOM_CREATOR.CREATED_ROOM': 'room_creator.created_room',
    'ROOM_CREATOR.UPDATED_ROOM': 'room_creator.updated_room',
    'ROOM_INVENTORY.UPDATE_ROOM_TEMPLATE': 'room_inventory.update_room_template',
    'ROOM_INVENTORY.UPDATE_VP_BUILDING_IMAGE': 'room_inventory.update_vp_building_image',
    'ROOM_SNAPSHOT.BUILDING_CHANGE_IN_ISLAND': 'room_snapshot.building_change_in_island',
    'ROOM_SNAPSHOT.FIRST_SNAPSHOT': 'room_snapshot.first_snapshot',
    'SOCIAL.BLOCK_CHAT': 'social.block_chat',
    'SOCIAL.NEW_USER': 'social.new_user',
    'SOCIAL.UNBLOCK_CHAT': 'social.unblock_chat'
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
