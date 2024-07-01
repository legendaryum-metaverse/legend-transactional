import { SagaCommenceConsumeChannel } from '../../Consumer';

export const sagaTitle = {
    /**
     * Saga used to update the social user's image.
     */
    UpdateUserImage: 'update_user:image',
    /**
     * Saga used in the flow to purchase resources and deduct coins from the user.
     */
    PurchaseResourceFlow: 'purchase_resource_flow',
    /**
     * Saga used to update the island room template and randomize the pv-image related.
     */
    UpdateIslandRoomTemplate: 'update_island_room_template'
} as const;
/**
 * Available saga titles.
 */
export type SagaTitle = (typeof sagaTitle)[keyof typeof sagaTitle];

export interface SagaCommencePayload {
    ['update_user:image']: {
        userId: string;
        folderName: string;
        bucketName: string;
    };
    ['purchase_resource_flow']: {
        userId: string;
        resourceId: string;
        price: number;
        quantity: number;
    };
    ['update_island_room_template']: {
        roomId: string;
        templateId: string;
        userId: string;
        images: string[];
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
