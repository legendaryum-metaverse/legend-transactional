import { Channel, ConsumeMessage } from 'amqplib';
import { MAX_OCCURRENCE, NACKING_DELAY_MS } from '../../constants';
import { fibonacci } from '../../utils';
import { exchange } from '../../@types';

// Type for exclusive options (either delay/maxRetries or maxOccurrence)
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type Nack = XOR<{ delay: number; maxRetries?: number }, { maxOccurrence: number; maxRetries?: number }>;

/**
 * Abstract base class for handling the consumption of messages from RabbitMQ channels.
 *
 * This class provides common functionality for acknowledging (ACK) and negatively acknowledging (NACK) messages, with the ability to introduce delays and retry mechanisms. It's designed to be extended by specific consumer channel implementations.
 */
abstract class ConsumeChannel {
  /**
   * The AMQP Channel object used for communication with RabbitMQ.
   */
  protected readonly channel: Channel;
  /**
   * The message received from RabbitMQ that this channel is currently processing.
   */
  protected readonly msg: ConsumeMessage;
  /**
   * The name of the queue from which the message was consumed.
   */
  protected readonly queueName: string;
  /**
   * Creates a new `ConsumeChannel` instance.
   *
   * @param channel - The AMQP Channel for interacting with RabbitMQ.
   * @param msg - The consumed message.
   * @param queueName - The name of the source queue.
   */
  public constructor(channel: Channel, msg: ConsumeMessage, queueName: string) {
    this.channel = channel;
    this.msg = msg;
    this.queueName = queueName;
  }

  /**
   * Acknowledges (ACKs) the message, indicating successful processing.
   *
   * @param payloadForNextStep - Optional payload to include for the next step in a multi-step process (e.g., saga).
   */
  public abstract ackMessage(payloadForNextStep?: Record<string, unknown>): void;
  /**
   * Negatively acknowledges (NACKs) the message with a specified delay and maximum retry count.
   *
   * This method is useful when you want to requeue the message for later processing, especially if the current attempt failed due to a temporary issue.
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
    const { delay: delayNackRetry, count } = this.nack({ delay, maxRetries });
    return { count, delay: delayNackRetry };
  }

  /**
   * Negatively acknowledges (NACKs) the message using a Fibonacci backoff strategy.
   *
   * The delay before requeuing increases with each retry according to the Fibonacci sequence, helping to avoid overwhelming the system in case of repeated failures.
   *
   * @param maxOccurrence - The maximum number of times the Fibonacci delay is allowed to increase before being reset. Defaults to `MAX_OCCURRENCE`.
   * @param maxRetries - The maximum number of times to requeue the message before giving up. Defaults to `undefined`, never giving up.
   * @returns An object containing:
   *   - `count`: The current retry count.
   *   - `delay`: The calculated Fibonacci delay (in milliseconds) applied to the nack.
   *   - `occurrence`: The current occurrence count for the Fibonacci sequence.
   * @see MAX_OCCURRENCE
   */
  public nackWithFibonacciStrategy(
    maxOccurrence: number = MAX_OCCURRENCE,
    maxRetries?: number,
  ): { count: number; delay: number; occurrence: number } {
    return this.nack({ maxOccurrence, maxRetries });
  }
  /**
   * Private helper function to handle the actual NACK logic.
   *
   * This method performs the NACK operation, manages retry counts and delays, and republishes the message for requeuing with appropriate headers and routing.
   *
   * @param nackOptions - An object specifying either:
   *   - `delay` and `maxRetries`: For linear backoff with a fixed delay and retry limit.
   *   - `maxOccurrence`: For Fibonacci backoff with a maximum occurrence count.
   */
  private nack({ maxRetries, maxOccurrence, delay }: Nack): {
    count: number;
    delay: number;
    occurrence: number;
  } {
    const { msg, queueName, channel } = this;
    channel.nack(msg, false, false); // nack without requeueing immediately

    // https://github.com/rabbitmq/rabbitmq-server/issues/10709
    // https://github.com/spring-cloud/spring-cloud-stream/issues/2939
    let count = 0;
    if (msg.properties.headers && msg.properties.headers['x-retry-count']) {
      count = Number(msg.properties.headers['x-retry-count']);
    }
    count++;

    let occurrence = 0;
    if (msg.properties.headers && msg.properties.headers['x-occurrence']) {
      occurrence = Number(msg.properties.headers['x-occurrence']);
      // if 'maxOccurrence' is defined, the strategy is fibonacci
      if (occurrence >= (maxOccurrence ?? Infinity)) {
        // the occurrence is reset to 0 to avoid large delay in the next nack
        occurrence = 0;
      }
    }
    occurrence++;

    // if 'delay' is defined, it is delay strategy, otherwise fibonacci
    const nackDelay = delay ?? fibonacci(occurrence) * 1000;

    if (maxRetries && count > maxRetries) {
      console.error(`MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`);
      // nada más que hacer, termina el proceso
      return { count: count, delay: nackDelay, occurrence };
    }

    // Checkeo para verificar si cambia el x-death en futuros rabbits
    if (msg.properties?.headers?.['x-death'] && msg.properties.headers['x-death'].length > 1) {
      const logData = {
        'x-death': msg.properties.headers['x-death'],
        queueName,
        msg: msg.content.toString(),
        headers: msg.properties.headers,
      };
      console.warn('x-death length > 1 -> TIME TO REFACTOR', logData);
    }

    const xHeaders = {
      'x-retry-count': count,
      // 'count' and 'occurrence' are the same if the strategy is delay
      'x-occurrence': occurrence,
    } as const;

    // destinado a eventos -> matching headers
    if (msg.fields.exchange === exchange.Matching) {
      if (msg.properties?.headers?.['all-micro']) {
        // importantísimo, el header que se borra es aquel que tiene todos los micros escuchando cierto evento, sino el nacking le llega a todos.
        delete msg.properties.headers['all-micro'];
      }
      // Viene de una nacking de eventos
      channel.publish(exchange.MatchingRequeue, ``, msg.content, {
        expiration: nackDelay,
        headers: {
          ...msg.properties.headers,
          // el nacking es dirigido a un microservicio en particular, el que nackeó.
          micro: queueName,
          ...xHeaders,
        },
        persistent: true,
        // Solo se pasa lo que se necesita, se podría pasar "...msg.properties"
        messageId: msg.properties.messageId,
        appId: msg.properties.appId,
      });
    } else {
      // destinado al Saga
      channel.publish(exchange.Requeue, `${queueName}_routing_key`, msg.content, {
        expiration: nackDelay,
        headers: { ...msg.properties.headers, ...xHeaders },
        persistent: true,
        // Solo se pasa lo que se necesita, se podría pasar "...msg.properties"
        messageId: msg.properties.messageId,
        appId: msg.properties.appId,
      });
    }

    return { count, delay: nackDelay, occurrence };
  }
}

export default ConsumeChannel;
