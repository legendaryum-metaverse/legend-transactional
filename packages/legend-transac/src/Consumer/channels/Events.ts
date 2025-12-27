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
  private readonly processorMicroservice: string;

  /**
   * The original event that was received
   */
  private readonly processedEvent: string;

  /**
   * The unique event identifier (messageId) for tracking across audit events
   */
  private readonly eventId: string;

  /**
   * The microservice that originally published the event
   */
  private readonly publisherMicroservice: string;

  /**
   * Creates a new EventsConsumeChannel instance
   *
   * @param channel - The AMQP Channel
   * @param msg - The consumed message
   * @param queueName - The queue name
   * @param processorMicroservice - The microservice name processing the event
   * @param processedEvent - The event type being processed
   * @param eventId - Unique event identifier (messageId) for audit tracking
   * @param publisherMicroservice - The microservice that originally published the event
   */
  constructor(
    channel: Channel,
    msg: ConsumeMessage,
    queueName: string,
    processorMicroservice: string,
    processedEvent: string,
    eventId: string,
    publisherMicroservice: string,
  ) {
    super(channel, msg, queueName);
    this.processorMicroservice = processorMicroservice;
    this.processedEvent = processedEvent;
    this.eventId = eventId;
    this.publisherMicroservice = publisherMicroservice;
  }

  /**
   * Acknowledges the consumed saga event/command.
   * Automatically emits audit.processed event after successful ACK.
   */
  ackMessage(): void {
    // First, ack the original message
    this.channel.ack(this.msg, false);

    // Then emit audit.processed event automatically
    const timestamp = Date.now(); // UNIX timestamp in milliseconds

    publishAuditEvent(this.channel, 'audit.processed', {
      publisher_microservice: this.publisherMicroservice,
      processor_microservice: this.processorMicroservice,
      processed_event: this.processedEvent,
      processed_at: timestamp,
      queue_name: this.queueName,
      event_id: this.eventId, // UUID v7 from message properties for cross-event tracking
    }).catch((error) => {
      console.error('Failed to emit audit.processed event:', error);
    });
  }

  /**
   * Negatively acknowledges (NACKs) the message with a specified delay and maximum retry count.
   *
   * This method is useful when you want to requeue the message for later processing, especially if the current attempt failed due to a temporary issue.
   *
   * Additionally, this override automatically emits an `audit.dead_letter` event to track the rejection.
   *
   * @param delay - The delay (in milliseconds) before requeueing the message. Defaults to `NACKING_DELAY_MS`.
   * @param maxRetries - The maximum number of times to requeue the message before giving up. Defaults to `undefined`, never giving up.
   * @returns An object containing:
   *   - `count`: The current retry count.
   *   - `delay`: The actual delay applied to the nack.
   *
   * @see NACKING_DELAY_MS
   */
  public nackWithDelay(delay: number = NACKING_DELAY_MS, maxRetries?: number): { count: number; delay: number } {
    // Call parent's nack implementation using the instance method
    const parentNack = super.nackWithDelay(delay, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Date.now();

    publishAuditEvent(this.channel, 'audit.dead_letter', {
      publisher_microservice: this.publisherMicroservice,
      rejector_microservice: this.processorMicroservice,
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
   * Negatively acknowledges (NACKs) the message using a Fibonacci backoff strategy.
   *
   * The delay before requeuing increases with each retry according to the Fibonacci sequence, helping to avoid overwhelming the system in case of repeated failures.
   *
   * Additionally, this override automatically emits an `audit.dead_letter` event to track the rejection.
   *
   * @param maxOccurrence - The maximum number of times the Fibonacci delay is allowed to increase before being reset. Defaults to `MAX_OCCURRENCE`.
   * @param maxRetries - The maximum number of times to requeue the message before giving up. Defaults to `undefined`, never giving up.
   * @returns An object containing:
   *   - `count`: The current retry count.
   *   - `delay`: The calculated Fibonacci delay (in milliseconds) applied to the nack.
   *   - `occurrence`: The current occurrence count for the Fibonacci sequence.
   *
   * @see MAX_OCCURRENCE
   */
  public nackWithFibonacciStrategy(
    maxOccurrence: number = MAX_OCCURRENCE,
    maxRetries?: number,
  ): { count: number; delay: number; occurrence: number } {
    // Call parent's nack implementation using the instance method
    const parentNack = super.nackWithFibonacciStrategy(maxOccurrence, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Date.now();

    publishAuditEvent(this.channel, 'audit.dead_letter', {
      publisher_microservice: this.publisherMicroservice,
      rejector_microservice: this.processorMicroservice,
      rejected_event: this.processedEvent,
      rejected_at: timestamp,
      queue_name: this.queueName,
      rejection_reason: 'fibonacci_strategy',
      retry_count: parentNack.count,
      event_id: this.eventId, // UUID v7 from message properties for cross-event tracking
    }).catch((error) => {
      // Log but don't fail the nack operation
      console.error('Failed to emit audit.dead_letter event:', error);
    });

    return parentNack;
  }
}
