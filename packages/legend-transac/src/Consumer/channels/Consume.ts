import { Channel, ConsumeMessage } from 'amqplib';
import { MAX_NACK_RETRIES, MAX_OCCURRENCE, NACKING_DELAY_MS } from '../../constants';
import { fibonacci } from '../../utils';
import { exchange } from '../../@types';

interface NackRetry {
    count: number;
    delay: number;
    occurrence: number;
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export type Nack = XOR<{ delay: number; maxRetries: number }, { maxOccurrence: number }>;

/**
 * Abstract class representing a consumer channel for processing messages in a microservices environment.
 *
 * @typeparam T - The type of available microservices.
 */
abstract class ConsumeChannel {
    /**
     * The channel to interact with the message broker.
     */
    protected readonly channel: Channel;
    /**
     * The consumed message to be processed.
     */
    protected readonly msg: ConsumeMessage;
    /**
     * The name of the queue from which the message was consumed.
     */
    protected readonly queueName: string;
    /**
     * Constructs a new instance of the ConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
    }

    /**
     * Method to acknowledge the message, optionally providing payload for the next step.
     *
     * @param {Record<string, unknown>} [payloadForNextStep] - Payload for the next step.
     */
    public abstract ackMessage(payloadForNextStep?: Record<string, unknown>): void;

    /**
     * Method to negatively acknowledge the message with a delay and retries.
     *
     * @param {number} [delay] - The delay before requeueing the message.
     * @param {number} [maxRetries] - The maximum number of nack retries.
     * @returns {Promise<number>} A promise resolving to the count of retries.
     * @see nackWithDelay
     * @see NACKING_DELAY_MS
     * @see MAX_NACK_RETRIES
     */
    public nackWithDelayAndRetries = (
        delay: number = NACKING_DELAY_MS,
        maxRetries: number = MAX_NACK_RETRIES
    ): NackRetry => {
        return this.nack({ delay, maxRetries });
    };

    /**
     * This method negatively acknowledges a message using a Fibonacci delay strategy.
     * Due to memory persistence, another container will nack with a different delay in milliseconds.
     *
     * To prevent large delays, the maxOccurrence is used to reset the occurrence to 0
     * making the next delay reset to the first value of a fibonacci sequence: 1s.
     * @param {number} [maxOccurrence] - The maximum occurrence in a fail saga step of the nack delay with fibonacci strategy.
     * @param {string} [salt] - The salt to use for hashing the saga step.
     *
     * @returns {Promise<Object>} A promise resolving to the count of retries according to RabbitMQ, the delay in ms, and the occurrence of the nacking in the current container.
     *
     * @see MAX_OCCURRENCE
     */
    public nackWithFibonacciStrategy = (
        maxOccurrence: number = MAX_OCCURRENCE
    ): {
        count: number;
        delay: number;
        occurrence: number;
    } => {
        return this.nack({ maxOccurrence });
    };

    private nack = ({
        maxRetries,
        maxOccurrence,
        delay
    }: Nack): {
        count: number;
        delay: number;
        occurrence: number;
    } => {
        const { msg, queueName, channel } = this;
        channel.nack(msg, false, false); // nack without requeueing immediately

        let count = 1;
        // La estrategia de "count" se aplica con custom headers
        // https://github.com/rabbitmq/rabbitmq-server/issues/10709
        // https://github.com/spring-cloud/spring-cloud-stream/issues/2939
        if (msg.properties.headers && msg.properties.headers['x-retry-count']) {
            count = (msg.properties.headers['x-retry-count'] as number) + 1;
        }

        let occurrence = 0;
        // TODO, pensar bien la ocurrencia!!!!
        if (msg.properties.headers && msg.properties.headers['x-occurrence']) {
            occurrence = Number(msg.properties.headers['x-occurrence']);
            if (occurrence >= (maxOccurrence ?? Infinity)) {
                // the occurrence is reset to 0 to avoid large delay in the next nack
                occurrence = 0;
            }
        }

        let nackDelay;

        if (maxRetries !== undefined) {
            nackDelay = delay;
            if (count > maxRetries) {
                console.error(
                    `MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`
                );
                // nada más que hacer, termina el proceso
                return { count: maxRetries, delay: nackDelay, occurrence };
            }
        } else {
            // si maxRetries no está definido entonces delay no está definido, por lo tanto es fibo
            nackDelay = fibonacci(occurrence + 1) * 1000;
        }

        // Checkeo para verificar si cambia el x-death en futuros rabbits
        if (msg.properties?.headers?.['x-death'] && msg.properties.headers['x-death'].length > 1) {
            const logData = {
                'x-death': msg.properties.headers['x-death'],
                queueName,
                msg: msg.content.toString(),
                headers: msg.properties.headers
            };
            console.warn('x-death length > 1 -> TIME TO REFACTOR', logData);
        }

        const xHeaders = {
            // persisto la cuenta de nacks
            'x-retry-count': count,
            // incremento la ocurrencia
            'x-occurrence': occurrence + 1
        };

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
                    ...xHeaders
                },
                persistent: true
            });
        } else {
            // destinado al Saga
            channel.publish(exchange.Requeue, `${queueName}_routing_key`, msg.content, {
                expiration: nackDelay,
                headers: { ...msg.properties.headers, ...xHeaders },
                persistent: true
            });
        }

        return { count, delay: nackDelay, occurrence };
    };
}

export default ConsumeChannel;
