/**
 * Represents the names of specific message queues in the RabbitMQ context.
 */
export const queue = {
  /**
   * Audit queue names for separate audit event types
   * @constant
   */
  AuditReceived: 'audit_received_commands',
  AuditProcessed: 'audit_processed_commands',
  AuditDeadLetter: 'audit_dead_letter_commands',
  /**
   * Queue used for sending replies in response to saga events.
   */
  ReplyToSaga: 'reply_to_saga',
  /**
   * Queue used for commencing a saga.
   */
  CommenceSaga: 'commence_saga',
} as const;
/**
 * Represents the names of exchanges, which act as message routing hubs in the RabbitMQ context.
 */
export const exchange = {
  /**
   * Audit exchange name for direct routing of audit events
   */
  Audit: 'audit_exchange',
  /**
   * Exchange dedicated to requeueing messages that require further processing in a saga process
   */
  Requeue: 'requeue_exchange',
  /**
   * Exchange for sending command messages to various consumers in a saga process
   */
  Commands: 'commands_exchange',
  /**
   * Exchange used for replying to saga events from consumers.
   */
  ReplyToSaga: 'reply_exchange',
  /**
   * Exchange used for starting a saga.
   */
  CommenceSaga: 'commence_saga_exchange',
  /**
   * Exchange used for starting a saga.
   */
  Matching: 'matching_exchange',
  /**
   * Exchange dedicated to requeueing messages that require further processing.
   */
  MatchingRequeue: 'matching_requeue_exchange',
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
