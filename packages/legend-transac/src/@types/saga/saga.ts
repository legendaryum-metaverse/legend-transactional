export const sagaTitle = {
    /**
     * Saga used to recharge the balance of a user.
     */
    RechargeBalance: 'recharge_balance',
    /**
     * Saga used to buy products.
     */
    BuyProducts: 'buy_products',
    /**
     * Saga used to persist the redsys response.
     */
    PersistRedsys: 'persist_redsys',
    /**
     * Saga used to send an email with a token to recover the password in auth.
     */
    SendEmailToken: 'send_email:token'
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
