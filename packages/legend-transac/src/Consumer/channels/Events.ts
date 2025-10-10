import { Channel, ConsumeMessage } from 'amqplib';
import ConsumeChannel from './Consume';
import { publishAuditEvent } from '../../Broker/PublishAuditEvent';
import { NACKING_DELAY_MS, MAX_OCCURRENCE } from '../../constants';

/**
 * Represents a **_consume_** channel for handling saga events/commands.
 * Extends the abstract ConsumeChannel class with automatic audit event emission.
 *
 */
export class EventsConsumeChannel extends ConsumeChannel {
  /**
   * The microservice name that is processing the event
   */
  private readonly microservice: string;

  /**
   * The original event that was received
   */
  private readonly processedEvent: string;

  /**
   * The unique event identifier (messageId) for tracking across audit events
   */
  private readonly eventId: string;

  /**
   * Creates a new EventsConsumeChannel instance
   *
   * @param channel - The AMQP Channel
   * @param msg - The consumed message
   * @param queueName - The queue name
   * @param microservice - The microservice name processing the event
   * @param processedEvent - The event type being processed
   * @param eventId - Optional unique event identifier (messageId) for audit tracking
   */
  constructor(
    channel: Channel,
    msg: ConsumeMessage,
    queueName: string,
    microservice: string,
    processedEvent: string,
    eventId: string,
  ) {
    super(channel, msg, queueName);
    this.microservice = microservice;
    this.processedEvent = processedEvent;
    this.eventId = eventId;
  }

  /**
   * Acknowledges the consumed saga event/command.
   * Automatically emits audit.processed event after successful ACK.
   */
  ackMessage(): void {
    // First, ack the original message
    this.channel.ack(this.msg, false);

    // Then emit audit.processed event automatically
    const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds

    publishAuditEvent(this.channel, 'audit.processed', {
      microservice: this.microservice,
      processed_event: this.processedEvent,
      processed_at: timestamp,
      queue_name: this.queueName,
      event_id: this.eventId, // UUID v7 from message properties for cross-event tracking
    }).catch((error) => {
      console.error('Failed to emit audit.processed event:', error);
    });
  }

  /**
   * Override nackWithDelay to emit audit.dead_letter event
   */
  public nackWithDelay(delay: number = NACKING_DELAY_MS, maxRetries?: number): { count: number; delay: number } {
    // Call parent's nack implementation using the instance method
    const parentNack = super.nackWithDelay(delay, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Math.floor(Date.now() / 1000);

    publishAuditEvent(this.channel, 'audit.dead_letter', {
      microservice: this.microservice,
      rejected_event: this.processedEvent,
      rejected_at: timestamp,
      queue_name: this.queueName,
      rejection_reason: 'delay',
      retry_count: parentNack.count,
      event_id: this.eventId, // UUID v7 from message properties for cross-event tracking
    }).catch((error) => {
      // Log but don't fail the nack operation
      console.error('Failed to emit audit.dead_letter event:', error);
    });

    return parentNack;
  }

  /**
   * Override nackWithFibonacciStrategy to emit audit.dead_letter event
   */
  public nackWithFibonacciStrategy(
    maxOccurrence: number = MAX_OCCURRENCE,
    maxRetries?: number,
  ): { count: number; delay: number; occurrence: number } {
    // Call parent's nack implementation using the instance method
    const parentNack = super.nackWithFibonacciStrategy(maxOccurrence, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Math.floor(Date.now() / 1000);

    publishAuditEvent(this.channel, 'audit.dead_letter', {
      microservice: this.microservice,
      rejected_event: this.processedEvent,
      rejected_at: timestamp,
      queue_name: this.queueName,
      rejection_reason: 'fibonacci_strategy',
      retry_count: parentNack.count,
      event_id: this.eventId, //
    }).catch((error) => {
      // Log but don't fail the nack operation
      console.error('Failed to emit audit.dead_letter event:', error);
    });

    return parentNack;
  }
}
