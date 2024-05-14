import { Channel, ConsumeMessage } from 'amqplib';
import { nackWithDelay } from '../nack';
import { MAX_NACK_RETRIES, MAX_OCCURRENCE, NACKING_DELAY_MS } from '../../constants';
import { fibonacci } from '../../utils';
import { getConsumeChannel } from '../../Connections';
import { exchange } from '../../@types';

type HashId = string;
// TODO: toda la estrategia de ocurrence es en memoria. Cuando el nacking sea relevante se refactoriza con redis para
// escalar en varios pods.
interface Occurrence {
    hashId: string;
    count: number;
}

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
     * The name of the queue from which the message was consumed.
     */
    private hashId?: string;
    /**
     * The map of saga step occurrences.
     */
    static readonly occurrence = new Map<HashId, number>();

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
    public nackWithDelayAndRetries = async (delay?: number, maxRetries?: number): Promise<number> => {
        return await this.nackWithDelay(delay, maxRetries);
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
    public abstract nackWithFibonacciStrategy(
        maxOccurrence?: number,
        salt?: string
    ): Promise<{
        count: number;
        delay: number;
        occurrence: number;
    }>;

    protected nackWithFibonacciStrategyHelper = async (maxOccurrence = MAX_OCCURRENCE, hashId: string) => {
        this.hashId = hashId;
        const occurrence = this.updateOccurrence(hashId, maxOccurrence);
        const delay = fibonacci(occurrence) * 1000; // ms
        const count = await this.nackWithDelayAndRetries(delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    };

    /**
     * Method to update the saga step occurrence map.
     *
     * @param {number} maxOccurrence - The maximum occurrence in a fail saga step of the nack delay with fibonacci strategy.
     * @param {string} hashId - The hash id of the saga step.
     * @returns {number} The updated occurrence in a saga step.
     *
     * @see MAX_OCCURRENCE
     */
    protected updateOccurrence = (hashId: string, maxOccurrence: number): number => {
        let occurrence = ConsumeChannel.occurrence.get(hashId) || 0;
        if (occurrence >= maxOccurrence) {
            // the occurrence is reset to 0 to avoid large delay in the next nack
            occurrence = 0;
        }

        ConsumeChannel.occurrence.set(hashId, occurrence + 1);
        return occurrence + 1;
    };

    private nackWithDelay = async (
        delay: number = NACKING_DELAY_MS,
        maxRetries: number = MAX_NACK_RETRIES
    ): Promise<number> => {
        const { msg, queueName, channel, hashId } = this;
        channel.nack(msg, false, false); // nack without requeueing immediately

        let count = 1;
        // La estrategia de "count" se aplica con custom headers
        // https://github.com/rabbitmq/rabbitmq-server/issues/10709
        // https://github.com/spring-cloud/spring-cloud-stream/issues/2939
        if (msg.properties.headers && msg.properties.headers['x-retry-count']) {
            count = (msg.properties.headers['x-retry-count'] as number) + 1;
        }

        let occurrence: Occurrence;
        if (hashId && msg.properties.headers && msg.properties.headers['x-occurrence']) {
            const o = msg.properties.headers['x-occurrence'] as string;
            occurrence = JSON.parse(o);
            if (occurrence.hashId === hashId) {
                // si es que no lo encuentro actualizo el hasId
                occurrence.count = (occurrence.count || 0) + 1;
            }
        } else{
        //     TODD: si no lo encuntreo es la primera vez!
        }
        // saliendo de este if ocurrence esta definido

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

        if (count > maxRetries) {
            console.error(`MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`);
            // nada más que hacer, termina el proceso
            return maxRetries;
        }

        if (msg.fields.exchange === exchange.Matching) {
            if (msg.properties?.headers?.['all-micro']) {
                // importantísimo, el header que se borra es aquel que tiene todos los micros escuchando cierto evento, sino el nacking le llega a todos.
                delete msg.properties.headers['all-micro'];
            }
            // Viene de una nacking de eventos
            channel.publish(exchange.MatchingRequeue, ``, msg.content, {
                expiration: delay,
                headers: {
                    ...msg.properties.headers,
                    // el nacking es dirigido a un microservicio en particular, el que nackeó.
                    micro: queueName,
                    // persisto la cuenta de nacks
                    'x-retry-count': count
                },
                persistent: true
            });
        } else {
            // destinado al Saga
            channel.publish(exchange.Requeue, `${queueName}_routing_key`, msg.content, {
                expiration: delay,
                headers: { ...msg.properties.headers, 'x-retry-count': count },
                persistent: true
            });
        }

        return count;
    };
}

export default ConsumeChannel;
