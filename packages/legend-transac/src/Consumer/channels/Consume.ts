import { AvailableMicroservices, SagaStep } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import crypto from 'crypto';

type StepHashId = string;
type Occurrence = number;

/**
 * Abstract class representing a consumer channel for processing messages in a microservices environment.
 *
 * @typeparam T - The type of available microservices.
 */
abstract class ConsumeChannel<T extends AvailableMicroservices> {
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
     * The saga step associated with the consumed message.
     */
    protected readonly step: SagaStep<T>;
    /**
     * The map of saga step occurrences.
     */
    static readonly sagaStepOccurrence = new Map<StepHashId, Occurrence>();

    /**
     * Constructs a new instance of the ConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {SagaStep} step - The saga step associated with the consumed message.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, step: SagaStep<T>) {
        this.channel = channel;
        this.msg = msg;
        this.queueName = queueName;
        this.step = step;
    }

    /**
     * Method to acknowledge the message, optionally providing payload for the next step.
     *
     * @param {Record<string, any>} [payloadForNextStep] - Payload for the next step.
     */
    public abstract ackMessage(payloadForNextStep?: Record<string, any>): void;

    /**
     * Method to negatively acknowledge the message.
     * @deprecated Use {@link nackWithDelayAndRetries} instead.
     */
    protected abstract nackMessage(): void;

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
    public abstract nackWithDelayAndRetries(delay?: number, maxRetries?: number): Promise<number>;

    /**
     * This method negatively acknowledges a message using a Fibonacci delay strategy.
     * Due to memory persistence, another container will nack with a different delay in milliseconds.
     *
     * @param {string} [salt] - The salt to use for hashing the saga step.
     *
     * @returns {Promise<Object>} A promise resolving to the count of retries according to RabbitMQ, the delay in ms, and the occurrence of the nacking in the current container.
     */
    public abstract nackWithFibonacciStrategy(salt?: string): Promise<{
        count: number;
        delay: number;
        occurrence: number;
    }>;

    /**
     * Method to update the saga step occurrence map.
     *
     * @param {string} salt - The salt to use for hashing the saga step.
     * @returns {number} The updated occurrence in a saga step.
     */
    protected updateSagaStepOccurrence = (salt: string): number => {
        const hashId = this.getStepHashId(salt);
        const occurrence = ConsumeChannel.sagaStepOccurrence.get(hashId) || 0;
        ConsumeChannel.sagaStepOccurrence.set(hashId, occurrence + 1);
        return occurrence + 1;
    };

    /**
     * Method to get the hash id of a saga step.
     * The hash id is used to identify a saga step in the saga step occurrence map.
     *
     * @param {string} salt - The salt to use for hashing the saga step.
     * @returns {string} The hash id of the saga step.
     */
    private getStepHashId = (salt: string): string => {
        const { sagaId, command, payload } = this.step;
        const hash = crypto.createHash('sha256');
        hash.update(`${sagaId}-${command}-${JSON.stringify(payload)}-${salt}`);
        return hash.digest('hex').slice(0, 10);
    };
}

export default ConsumeChannel;
