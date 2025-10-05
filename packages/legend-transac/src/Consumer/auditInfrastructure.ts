import { getConsumeChannel } from '../Connections';
import { exchange, queue } from '../@types';

/**
 * Creates audit logging infrastructure with direct exchange and separate queues
 * Uses direct exchange for efficient single-consumer delivery to audit microservice
 *
 * This function sets up the RabbitMQ infrastructure needed for audit event tracking:
 * - Creates a direct exchange for audit events
 * - Creates 3 separate queues (audit.received, audit.processed, audit.dead_letter)
 * - Binds each queue to the audit exchange with appropriate routing keys
 *
 * The direct exchange strategy ensures that:
 * - Only the audit microservice consumes audit events
 * - Routing is efficient (no pattern matching needed)
 * - Each audit event type has its own queue for isolation
 *
 * @internal This is called automatically when connecting to events
 */
export const createAuditLoggingResources = async (): Promise<void> => {
  const channel = await getConsumeChannel();

  await Promise.all([
    // Create direct exchange for audit events
    channel.assertExchange(exchange.Audit, 'direct', { durable: true }),

    // Create queues for audit events
    channel.assertQueue(queue.AuditReceived, { durable: true }),
    channel.assertQueue(queue.AuditProcessed, { durable: true }),
    channel.assertQueue(queue.AuditDeadLetter, { durable: true }),
  ]);

  await Promise.all([
    // Bind each queue to its specific routing key
    channel.bindQueue(queue.AuditReceived, exchange.Audit, 'audit.received'),
    channel.bindQueue(queue.AuditProcessed, exchange.Audit, 'audit.processed'),
    channel.bindQueue(queue.AuditDeadLetter, exchange.Audit, 'audit.dead_letter'),
  ]);
};
