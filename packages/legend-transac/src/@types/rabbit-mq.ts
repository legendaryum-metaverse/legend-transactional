/**
 * Represents the names of specific message queues in the RabbitMQ context.
 */
export const queue = {
    /**
     * Queue used for sending replies in response to saga events.
     */
    ReplyToSaga: 'reply_to_saga',
    CommenceSaga: 'commence_saga'
} as const;
/**
 * Represents the names of exchanges, which act as message routing hubs in the RabbitMQ context.
 */
export const exchange = {
    /**
     * Exchange dedicated to requeueing messages that require further processing.
     */
    Requeue: 'requeue_exchange',
    /**
     * Exchange for sending command messages to various consumers.
     */
    Commands: 'commands_exchange',
    /**
     * Exchange used for replying to saga events from consumers.
     */
    ReplyToSaga: 'reply_exchange',
    CommenceSaga: 'commence_saga_exchange'
} as const;
/**
 * Represents the names of specific message queues in the RabbitMQ context.
 */
export type Exchange = (typeof exchange)[keyof typeof exchange];
/**
 * Properties defining a queue consumer within the RabbitMQ context.
 */
export interface QueueConsumerProps {
    /**
     * The name of the queue that messages will be consumed from.
     */
    queueName: string;
    /**
     * The associated exchange for the queue, used for routing messages.
     */
    exchange: Exchange;
}
