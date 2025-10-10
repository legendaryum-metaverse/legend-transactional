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
