import { CommenceSaga } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import crypto from 'crypto';
import { MAX_OCCURRENCE } from '../../constants';
import { fibonacci } from '../../utils';
import { nackWithDelay } from '../nack';

type SagaHashId = string;
type Occurrence = number;

/**
 * Class representing a consumer channel for processing sagas in a microservice environment.
 *
 */
export class SagaCommenceConsumeChannel {
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
     * The saga associated with the consumed message.
     */
    protected readonly saga: CommenceSaga;
    /**
     * The map of saga occurrences.
     */
    static readonly sagaOccurrence = new Map<SagaHashId, Occurrence>();

    /**
     * Constructs a new instance of the SagaCommenceConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {CommenceSaga} saga - The saga associated with the consumed message.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, saga: CommenceSaga) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
        this.saga = saga;
    }

    /**
     * Method to acknowledge the message.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }

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
    async nackWithDelayAndRetries(delay?: number, maxRetries?: number): Promise<number> {
        return await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }

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
    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const occurrence = this.updateSagaOccurrence(`SagaCommenceConsumeChannel-${salt}`, maxOccurrence);
        const delay = fibonacci(occurrence) * 1000; // ms
        const count = await this.nackWithDelayAndRetries(delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    }

    /**
     * Method to update the saga occurrence map.
     *
     * @param {string} salt - The salt to use for hashing the saga.
     * @param {number} maxOccurrence - The maximum occurrence in a fail saga of the nack delay with fibonacci strategy.
     * @returns {number} The updated occurrence in a saga.
     *
     * @see MAX_OCCURRENCE
     */
    private updateSagaOccurrence = (salt: string, maxOccurrence: number): number => {
        const hashId = this.getSagaHashId(salt);
        let occurrence = SagaCommenceConsumeChannel.sagaOccurrence.get(hashId) || 0;
        if (occurrence >= maxOccurrence) {
            // the occurrence is reset to 0 to avoid large delay in the next nack
            occurrence = 0;
        }
        SagaCommenceConsumeChannel.sagaOccurrence.set(hashId, occurrence + 1);
        return occurrence + 1;
    };

    /**
     * Method to get the hash id of a saga.
     * The hash id is used to identify a saga in the saga occurrence map.
     *
     * @param {string} salt - The salt to use for hashing the saga.
     * @returns {string} The hash id of the saga.
     */
    private getSagaHashId = (salt: string): string => {
        const { title, payload } = this.saga;
        const hash = crypto.createHash('sha256');
        hash.update(`${title}-${JSON.stringify(payload)}-${salt}`);
        return hash.digest('hex').slice(0, 10);
    };
}
