export const sagaTitle = {
    /**
     * Saga used to add coins when a user is created for the first time.
     */
    UserCreationReward: 'new_user:creation_reward',
    /**
     * Saga used to update the social user's image.
     */
    UpdateUserImage: 'update_user:image'
} as const;
/**
 * Available saga titles.
 */
export type SagaTitle = (typeof sagaTitle)[keyof typeof sagaTitle];

/**
 * Represents the payload of a saga commence event.
 */
export interface CommenceSaga<T> {
    /*
     * The title of the saga in the event.
     */
    title: SagaTitle;
    /**
     * The payload associated with the event.
     */
    payload: T;
}
