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
 * Types of Payment Email Types
 */
export const PaymentEmailTypes = {
    PURCHASE: 'purchase',
    SUBSCRIPTION: 'subscription',
    NEW_SUBSCRIPTION: 'new_subscription'
} as const;

/**
 * Type of Payment Email Types
 */
export type PaymentEmailType = (typeof PaymentEmailTypes)[keyof typeof PaymentEmailTypes];

/**
 * Represents the winners of a ranking with their respective rewards
 */
export interface RankingWinners {
    userId: string;
    reward: number;
}

/**
 * Represents a completed ranking with its title, reward type, and winners
 */
export interface CompletedRanking {
    title: string;
    description: string;
    authorEmail: string;
    /**
     * End date converted to string
     */
    endsAt: string;
    /**
     * JSON stringified with each user's rewards
     */
    reward: string;
    rewardType: string;
    winners: RankingWinners[];
    // Present only if reward_type is "Nft"
    nftBlockchainNetwork?: string;
    nftContractAddress?: string;
    // Present only if reward_type is "Crypto"
    walletCryptoAsset?: string;
}

/**
 * Represents the possible genders a social user can have
 */
export const gender = {
    Male: 'MALE',
    Female: 'FEMALE',
    Undefined: 'UNDEFINED'
} as const;

/**
 * The `Gender` type is derived from the keys of the `gender`
 */
export type Gender = (typeof gender)[keyof typeof gender];

/**
 * Representes the user location
 */
export interface UserLocation {
    continent: string;
    country: string;
    region: string;
    city: string;
}

/**
 * Represents the social user model
 */
export interface SocialUser {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    gender: Gender;
    isPublicProfile?: boolean;
    followers: string[];
    following: string[];
    email: string;
    birthday?: Date;
    location?: UserLocation;
    avatar?: string;
    avatarScreenshot?: string;
    userImage?: string;
    glbUrl?: string;
    description?: string;
    socialMedia?: Map<string, string>;
    preferences: string[];
    blockedUsers: string[];
    RPMAvatarId?: string;
    RPMUserId?: string;
    paidPriceId?: string;
    createdAt: Date;
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
     * Event to logout a user.
     */
    'auth.logout_user': {
        userId: string;
    };
    /**
     * Event to duplicate minimal user data in the microservice that listens to it. This occurs when the user is created.
     */
    'auth.new_user': {
        id: string;
        email: string;
        username: string;
        userlastname: string;
    };
    /**
     * Event to update a user's subscription.
     */
    'coins.update_subscription': {
        userId: string;
        paidPriceId: string;
    };
    /**
     * Websocket event to notify the client about a coins related event.
     */
    'coins.notify_client': {
        room: `coins-${string}`;
        message: Record<string, unknown>;
    };
    /**
     * Event to send email to users.
     */
    'coins.send_email': {
        userId: string;
        email: string;
        emailType: PaymentEmailType;
        coins: number;
    };
    /**
     * Event to give the user coins for completing a mission
     */
    'legend_missions.completed_mission_reward': {
        userId: string;
        coins: number;
    };
    /**
     * Event to notify the mission's author that it has been created
     */
    'legend_missions.new_mission_created': {
        title: string;
        author: string;
        authorEmail: string;
        reward: number;
        startDate: string;
        endDate: string;
        maxPlayersClaimingReward: number;
        timeToReward: number;
    };
    /**
     * Event to set a mission in progress
     */
    'legend_missions.ongoing_mission': {
        redisKey: string;
    };
    /**
     * Event triggered to send an email notification when a user completes a crypto-based mission and earns a reward.
     */
    'legend_missions.send_email_crypto_mission_completed': {
        userId: string;
        missionTitle: string;
        reward: number;
        blockchainNetwork: string;
        cryptoAsset: string;
    };
    /**
     * Event triggered to send an email notification when a user redeems a code and completes a mission.
     */
    'legend_missions.send_email_code_exchange_mission_completed': {
        userId: string;
        missionTitle: string;
        codeValue: string;
        codeDescription: string;
    };
    /**
     * Event triggered to send an email notification when a user completes an NFT-related mission.
     */
    'legend_missions.send_email_nft_mission_completed': {
        userId: string;
        missionTitle: string;
        nftContractAddress: string;
        nftTokenId: string;
    };
    /**
     * Event to send emails to winners when the ranking finishes
     */
    'legend_rankings.rankings_finished': {
        completedRankings: CompletedRanking[];
    };
    /**
     * Event triggered when a product virtual is deleted
     */
    'legend_showcase.product_virtual_deleted': {
        productVirtualId: string;
        productVirtualSlug: string;
    };
    /**
     * Event to update the allowed mission subscription IDs
     */
    'legend_showcase.update_allowed_mission_subscription_ids': {
        productVirtualSlug: string;
        allowedSubscriptionIds: string[];
    };
    /**
     * Event to update the allowed ranking subscription IDs
     */
    'legend_showcase.update_allowed_ranking_subscription_ids': {
        productVirtualId: string;
        allowedSubscriptionIds: string[];
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
        socialUser: SocialUser;
    };
    /**
     * Event to unblock chat between two users.
     */
    'social.unblock_chat': {
        userId: string;
        userToUnblockId: string;
    };
    /**
     * A social user has been updated
     */
    'social.updated_user': {
        socialUser: SocialUser;
    };
    /**
     * Event to delete assets in batch
     */
    'social_media_rooms.delete_in_batch': {
        bucketName: string;
        filePaths: string[];
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
    'AUTH.LOGOUT_USER': 'auth.logout_user',
    'AUTH.NEW_USER': 'auth.new_user',
    'COINS.NOTIFY_CLIENT': 'coins.notify_client',
    'COINS.SEND_EMAIL': 'coins.send_email',
    'COINS.UPDATE_SUBSCRIPTION': 'coins.update_subscription',
    'LEGEND_MISSIONS.COMPLETED_MISSION_REWARD': 'legend_missions.completed_mission_reward',
    'LEGEND_MISSIONS.NEW_MISSION_CREATED': 'legend_missions.new_mission_created',
    'LEGEND_MISSIONS.ONGOING_MISSION': 'legend_missions.ongoing_mission',
    'LEGEND_MISSIONS.SEND_EMAIL_CRYPTO_MISSION_COMPLETED': 'legend_missions.send_email_crypto_mission_completed',
    'LEGEND_MISSIONS.SEND_EMAIL_CODE_EXCHANGE_MISSION_COMPLETED':
        'legend_missions.send_email_code_exchange_mission_completed',
    'LEGEND_MISSIONS.SEND_EMAIL_NFT_MISSION_COMPLETED': 'legend_missions.send_email_nft_mission_completed',
    'LEGEND_RANKINGS.RANKINGS_FINISHED': 'legend_rankings.rankings_finished',
    'LEGEND_SHOWCASE.PRODUCT_VIRTUAL_DELETED': 'legend_showcase.product_virtual_deleted',
    'LEGEND_SHOWCASE.UPDATE_ALLOWED_MISSION_SUBSCRIPTION_IDS':
        'legend_showcase.update_allowed_mission_subscription_ids',
    'LEGEND_SHOWCASE.UPDATE_ALLOWED_RANKING_SUBSCRIPTION_IDS':
        'legend_showcase.update_allowed_ranking_subscription_ids',
    'ROOM_CREATOR.CREATED_ROOM': 'room_creator.created_room',
    'ROOM_CREATOR.UPDATED_ROOM': 'room_creator.updated_room',
    'ROOM_INVENTORY.UPDATE_VP_BUILDING_IMAGE': 'room_inventory.update_vp_building_image',
    'ROOM_SNAPSHOT.BUILDING_CHANGE_IN_ISLAND': 'room_snapshot.building_change_in_island',
    'ROOM_SNAPSHOT.FIRST_SNAPSHOT': 'room_snapshot.first_snapshot',
    'SOCIAL.BLOCK_CHAT': 'social.block_chat',
    'SOCIAL.NEW_USER': 'social.new_user',
    'SOCIAL.UNBLOCK_CHAT': 'social.unblock_chat',
    'SOCIAL.UPDATED_USER': 'social.updated_user',
    'SOCIAL_MEDIA_ROOMS.DELETE_IN_BATCH': 'social_media_rooms.delete_in_batch'
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
