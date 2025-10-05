import { Channel, ConsumeMessage } from 'amqplib';
import ConsumeChannel from './Consume';
import { publishAuditProcessed, publishAuditDeadLetter } from '../../Broker/PublishAuditEvent';
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
   * Creates a new EventsConsumeChannel instance
   *
   * @param channel - The AMQP Channel
   * @param msg - The consumed message
   * @param queueName - The queue name
   * @param microservice - The microservice name processing the event
   * @param processedEvent - The event type being processed
   */
  constructor(channel: Channel, msg: ConsumeMessage, queueName: string, microservice: string, processedEvent: string) {
    super(channel, msg, queueName);
    this.microservice = microservice;
    this.processedEvent = processedEvent;
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

    publishAuditProcessed(this.channel, {
      microservice: this.microservice,
      processedEvent: this.processedEvent,
      processedAt: timestamp,
      queueName: this.queueName,
      eventId: undefined, // Optional: can be enhanced later
    }).catch((error) => {
      console.error('Failed to emit audit.processed event:', error);
    });
  }

  /**
   * Override nackWithDelay to emit audit.dead_letter event
   * Note: We override instead of calling super because nackWithDelay is an arrow function in the parent
   */
  public nackWithDelay = (delay: number = NACKING_DELAY_MS, maxRetries?: number): { count: number; delay: number } => {
    // Call parent's nack implementation using the instance method
    const parentNack = ConsumeChannel.prototype.nackWithDelay.call(this, delay, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Math.floor(Date.now() / 1000);

    publishAuditDeadLetter(this.channel, {
      microservice: this.microservice,
      rejectedEvent: this.processedEvent,
      rejectedAt: timestamp,
      queueName: this.queueName,
      rejectionReason: 'delay',
      retryCount: parentNack.count,
      eventId: undefined,
    }).catch((error) => {
      // Log but don't fail the nack operation
      console.error('Failed to emit audit.dead_letter event:', error);
    });

    return parentNack;
  };

  /**
   * Override nackWithFibonacciStrategy to emit audit.dead_letter event
   * Note: We override instead of calling super because nackWithFibonacciStrategy is an arrow function in the parent
   */
  public nackWithFibonacciStrategy = (
    maxOccurrence: number = MAX_OCCURRENCE,
    maxRetries?: number,
  ): { count: number; delay: number; occurrence: number } => {
    // Call parent's nack implementation using the instance method
    const parentNack = ConsumeChannel.prototype.nackWithFibonacciStrategy.call(this, maxOccurrence, maxRetries);

    // Emit audit.dead_letter event automatically
    const timestamp = Math.floor(Date.now() / 1000);

    publishAuditDeadLetter(this.channel, {
      microservice: this.microservice,
      rejectedEvent: this.processedEvent,
      rejectedAt: timestamp,
      queueName: this.queueName,
      rejectionReason: 'fibonacci_strategy',
      retryCount: parentNack.count,
      eventId: undefined,
    }).catch((error) => {
      // Log but don't fail the nack operation
      console.error('Failed to emit audit.dead_letter event:', error);
    });

    return parentNack;
  };
}
