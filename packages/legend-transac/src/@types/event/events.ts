/**
 * Types of rooms
 */
export const RoomTypes = {
  ISLAND: 'island',
  HOUSE: 'house',
  HALL_OF_FAME: 'hallOfFame',
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
  NEW_SUBSCRIPTION: 'new_subscription',
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
  Undefined: 'UNDEFINED',
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
   * Event to notify when a user is blocked (permanent emits only).
   */
  'auth.blocked_user': {
    userId: string;
    blockType: 'permanent' | 'temporary';
    blockReason?: string;
    blockExpirationHours?: number;
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
    notificationConfig?: {
      customEmails?: string[];
      templateName: string;
    };
  };
  /**
   * Event to set a mission in progress
   */
  'legend_missions.ongoing_mission': {
    redisKey: string;
  };
  /**
   * Event triggered when a mission finishes and needs to send final reports to participants
   */
  'legend_missions.mission_finished': {
    missionTitle: string;
    participants: Array<{
      userId?: string;
      email?: string;
      position?: number;
    }>;
  };
  /**
   * Event triggered to send an email notification when a user completes a crypto-based mission and earns a reward.
   */
  'legend_missions.send_email_crypto_mission_completed': {
    userId: string;
    missionTitle: string;
    reward: string;
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
   * Event to deliver intermediate reward (e.g., first game)
   */
  'legend_rankings.intermediate_reward': {
    userId: string;
    rankingId: number;
    intermediateRewardType: string;
    rewardConfig: Record<string, unknown>;
    templateName: string;
    templateData: Record<string, unknown>;
  };
  /**
   * Event to deliver participation reward (post-ranking)
   */
  'legend_rankings.participation_reward': {
    userId: string;
    rankingId: number;
    participationRewardType: string;
    rewardConfig: Record<string, unknown>;
    templateName: string;
    templateData: Record<string, unknown>;
  };
  /**
   * Event to notify when a ranking is created
   */
  'legend_rankings.new_ranking_created': {
    title: string;
    description: string;
    authorEmail: string;
    rewardType: string;
    endsAt: string;
    nftBlockchainNetwork?: string;
    nftContractAddress?: string;
    walletCryptoAsset?: string;
    notificationConfig?: {
      customEmails?: string[];
      templateName: string;
    };
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
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // AUDIT EVENTS - For tracking event lifecycle and debugging
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Emitted when an event is published by a microservice (audit tracking)
   */
  'audit.published': {
    /**
     * The microservice that published the event
     */
    publisher_microservice: string;
    /**
     * The event that was published
     */
    published_event: string;
    /**
     * Timestamp when the event was published (UNIX timestamp in milliseconds)
     */
    published_at: number;
    /**
     * UUID v7 unique identifier for cross-event tracking
     */
    event_id: string;
  };
  /**
   * Emitted when an event is received by a microservice before processing starts (audit tracking)
   */
  'audit.received': {
    /**
     * The microservice that published the original event
     */
    publisher_microservice: string;
    /**
     * The microservice that received the event
     */
    receiver_microservice: string;
    /**
     * The event that was received
     */
    received_event: string;
    /**
     * Timestamp when the event was received (UNIX timestamp in milliseconds)
     */
    received_at: number;
    /**
     * The queue name from which the event was consumed
     */
    queue_name: string;
    /**
     * UUID v7 from message properties for cross-event tracking
     */
    event_id: string;
  };
  /**
   * Emitted when an event is successfully processed by a microservice for audit tracking
   */
  'audit.processed': {
    /**
     * The microservice that published the original event
     */
    publisher_microservice: string;
    /**
     * The microservice that processed the event
     */
    processor_microservice: string;
    /**
     * The original event that was processed
     */
    processed_event: string;
    /**
     * Timestamp when the event was processed (UNIX timestamp in milliseconds)
     */
    processed_at: number;
    /**
     * The queue name where the event was consumed
     */
    queue_name: string;
    /**
     * UUID v7 from message properties for cross-event tracking
     */
    event_id: string;
  };
  /**
   * Emitted when a message is rejected/nacked and sent to dead letter queue
   */
  'audit.dead_letter': {
    /**
     * The microservice that published the original event
     */
    publisher_microservice: string;
    /**
     * The microservice that rejected the event
     */
    rejector_microservice: string;
    /**
     * The original event that was rejected
     */
    rejected_event: string;
    /**
     * Timestamp when the event was rejected (UNIX timestamp in milliseconds)
     */
    rejected_at: number;
    /**
     * The queue name where the event was rejected from
     */
    queue_name: string;
    /**
     * Reason for rejection (delay, fibonacci_strategy, etc.)
     */
    rejection_reason: 'delay' | 'fibonacci_strategy';
    /**
     * Optional retry count
     */
    retry_count?: number;
    /**
     * UUID v7 from message properties for cross-event tracking
     */
    event_id: string;
  };
}
/**
 * Represents the available events in the system.
 */
export const microserviceEvent = {
  'TEST.IMAGE': 'test.image',
  'TEST.MINT': 'test.mint',
  ///////////////////////////
  // AUDIT EVENTS - For tracking event lifecycle
  'AUDIT.PUBLISHED': 'audit.published',
  'AUDIT.RECEIVED': 'audit.received',
  'AUDIT.PROCESSED': 'audit.processed',
  'AUDIT.DEAD_LETTER': 'audit.dead_letter',
  ///////////////////////////
  'AUTH.DELETED_USER': 'auth.deleted_user',
  'AUTH.LOGOUT_USER': 'auth.logout_user',
  'AUTH.NEW_USER': 'auth.new_user',
  'AUTH.BLOCKED_USER': 'auth.blocked_user',
  'COINS.NOTIFY_CLIENT': 'coins.notify_client',
  'COINS.SEND_EMAIL': 'coins.send_email',
  'COINS.UPDATE_SUBSCRIPTION': 'coins.update_subscription',
  'LEGEND_MISSIONS.COMPLETED_MISSION_REWARD': 'legend_missions.completed_mission_reward',
  'LEGEND_MISSIONS.NEW_MISSION_CREATED': 'legend_missions.new_mission_created',
  'LEGEND_MISSIONS.ONGOING_MISSION': 'legend_missions.ongoing_mission',
  'LEGEND_MISSIONS.MISSION_FINISHED': 'legend_missions.mission_finished',
  'LEGEND_MISSIONS.SEND_EMAIL_CRYPTO_MISSION_COMPLETED': 'legend_missions.send_email_crypto_mission_completed',
  'LEGEND_MISSIONS.SEND_EMAIL_CODE_EXCHANGE_MISSION_COMPLETED':
    'legend_missions.send_email_code_exchange_mission_completed',
  'LEGEND_MISSIONS.SEND_EMAIL_NFT_MISSION_COMPLETED': 'legend_missions.send_email_nft_mission_completed',
  'LEGEND_RANKINGS.RANKINGS_FINISHED': 'legend_rankings.rankings_finished',
  'LEGEND_RANKINGS.NEW_RANKING_CREATED': 'legend_rankings.new_ranking_created',
  'LEGEND_RANKINGS.INTERMEDIATE_REWARD': 'legend_rankings.intermediate_reward',
  'LEGEND_RANKINGS.PARTICIPATION_REWARD': 'legend_rankings.participation_reward',
  'LEGEND_SHOWCASE.PRODUCT_VIRTUAL_DELETED': 'legend_showcase.product_virtual_deleted',
  'LEGEND_SHOWCASE.UPDATE_ALLOWED_MISSION_SUBSCRIPTION_IDS': 'legend_showcase.update_allowed_mission_subscription_ids',
  'LEGEND_SHOWCASE.UPDATE_ALLOWED_RANKING_SUBSCRIPTION_IDS': 'legend_showcase.update_allowed_ranking_subscription_ids',
  'ROOM_CREATOR.CREATED_ROOM': 'room_creator.created_room',
  'ROOM_CREATOR.UPDATED_ROOM': 'room_creator.updated_room',
  'ROOM_INVENTORY.UPDATE_VP_BUILDING_IMAGE': 'room_inventory.update_vp_building_image',
  'ROOM_SNAPSHOT.BUILDING_CHANGE_IN_ISLAND': 'room_snapshot.building_change_in_island',
  'ROOM_SNAPSHOT.FIRST_SNAPSHOT': 'room_snapshot.first_snapshot',
  'SOCIAL.BLOCK_CHAT': 'social.block_chat',
  'SOCIAL.NEW_USER': 'social.new_user',
  'SOCIAL.UNBLOCK_CHAT': 'social.unblock_chat',
  'SOCIAL.UPDATED_USER': 'social.updated_user',
  'SOCIAL_MEDIA_ROOMS.DELETE_IN_BATCH': 'social_media_rooms.delete_in_batch',
} as const;
/**
 * Available microservices events in the system.
 */
export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
