import { SagaCommenceConsumeChannel } from '../../Consumer';

export const sagaTitle = {
    /**
     * Saga used in the flow to purchase resources and deduct coins from the user.
     */
    PurchaseResourceFlow: 'purchase_resource_flow',
    /**
     * Saga used in to reward users based on their rankings.
     */
    RankingsUsersReward: 'rankings_users_reward',
    /**
     * Saga used to initiate a crypto transfer for a mission winner.
     */
    TransferCryptoRewardToMissionWinner: 'transfer_crypto_reward_to_mission_winner',
    /**
     * Saga used to initiate a crypto transfer for ranking winners.
     */
    TransferCryptoRewardToRankingWinners: 'transfer_crypto_reward_to_ranking_winners'
} as const;
/**
 * Available saga titles.
 */
export type SagaTitle = (typeof sagaTitle)[keyof typeof sagaTitle];

export interface SagaCommencePayload {
    ['purchase_resource_flow']: {
        userId: string;
        resourceId: string;
        price: number;
        quantity: number;
    };
    ['rankings_users_reward']: {
        rewards: { userId: string; coins: number }[];
    };
    ['transfer_crypto_reward_to_mission_winner']: {
        // Wallet address from which rewards will be transferred
        walletAddress: string;
        // ID of the user who completed the mission
        userId: string;
        // Amount to be transferred
        reward: string;
    };
    ['transfer_crypto_reward_to_ranking_winners']: {
        completedCryptoRankings: {
            walletAddress: string;
            winners: {
                userId: string;
                reward: string;
            }[];
        }[];
    };
}

/**
 * Represents the payload of a saga commence event.
 */
export interface CommenceSaga<U extends SagaTitle> {
    /*
     * The title of the saga in the event.
     */
    title: U;
    /**
     * The payload associated with the event.
     */
    payload: SagaCommencePayload[U];
}

export interface CommenceSagaHandler<U extends SagaTitle> {
    /**
     * The saga associated with the event.
     */
    saga: CommenceSaga<U>;
    /**
     * The channel used for consuming the event.
     */
    channel: SagaCommenceConsumeChannel;
}

/**
 * Represents the saga title emitted to commence a saga.
 */
export type CommenceSagaEvents<U extends SagaTitle> = {
    [key in U]: CommenceSagaHandler<key>;
};
