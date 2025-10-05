import { Channel } from 'amqplib';
import { EventPayload, exchange, MicroserviceEvent } from '../@types';

/**
 * Publishes audit events to the direct audit exchange
 * Uses the event type as routing key for flexible audit event routing
 *
 * @template T - The audit event type
 * @param channel - The RabbitMQ channel to publish through
 * @param eventType - The type of audit event ('audit.received' | 'audit.processed' | 'audit.dead_letter')
 * @param payload - The audit event payload
 * @returns Promise that resolves when the event is published
 *
 * @internal This method is used internally by the library to emit audit events automatically
 */
export async function publishAuditEvent<T extends MicroserviceEvent>(
  channel: Channel,
  eventType: T,
  payload: EventPayload[T],
): Promise<void> {
  try {
    // Declare audit exchange if it doesn't exist (idempotent operation)
    await channel.assertExchange(exchange.Audit, 'direct', {
      durable: true,
    });

    // Use event type as routing key for direct routing
    const routingKey = eventType; // 'audit.received' | 'audit.processed' | 'audit.dead_letter'

    const messageBuffer = Buffer.from(JSON.stringify(payload));

    channel.publish(exchange.Audit, routingKey, messageBuffer, {
      contentType: 'application/json',
      deliveryMode: 2, // persistent
    });
  } catch (error) {
    // Never fail the main flow if audit publishing fails
    console.error(`Failed to publish audit event ${eventType}:`, error);
  }
}

/**
 * Publishes an audit.received event - emitted when an event is received before processing
 *
 * @param channel - The RabbitMQ channel
 * @param payload - The audit.received payload
 *
 * @example
 * ```typescript
 * await publishAuditReceived(channel, {
 *   microservice: 'auth',
 *   receivedEvent: 'auth.new_user',
 *   receivedAt: Math.floor(Date.now() / 1000),
 *   queueName: 'auth_match_commands',
 * });
 * ```
 */
export async function publishAuditReceived(channel: Channel, payload: EventPayload['audit.received']): Promise<void> {
  await publishAuditEvent(channel, 'audit.received', payload);
}

/**
 * Publishes an audit.processed event - emitted when an event is successfully processed
 *
 * @param channel - The RabbitMQ channel
 * @param payload - The audit.processed payload
 *
 * @example
 * ```typescript
 * await publishAuditProcessed(channel, {
 *   microservice: 'auth',
 *   processedEvent: 'auth.new_user',
 *   processedAt: Math.floor(Date.now() / 1000),
 *   queueName: 'auth_match_commands',
 * });
 * ```
 */
export async function publishAuditProcessed(channel: Channel, payload: EventPayload['audit.processed']): Promise<void> {
  await publishAuditEvent(channel, 'audit.processed', payload);
}

/**
 * Publishes an audit.dead_letter event - emitted when a message is rejected/nacked
 *
 * @param channel - The RabbitMQ channel
 * @param payload - The audit.dead_letter payload
 *
 * @example
 * ```typescript
 * await publishAuditDeadLetter(channel, {
 *   microservice: 'auth',
 *   rejectedEvent: 'auth.new_user',
 *   rejectedAt: Math.floor(Date.now() / 1000),
 *   queueName: 'auth_match_commands',
 *   rejectionReason: 'fibonacci_strategy',
 *   retryCount: 3,
 * });
 * ```
 */
export async function publishAuditDeadLetter(
  channel: Channel,
  payload: EventPayload['audit.dead_letter'],
): Promise<void> {
  await publishAuditEvent(channel, 'audit.dead_letter', payload);
}
