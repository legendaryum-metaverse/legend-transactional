import { CommenceSaga } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import crypto from 'crypto';
import { MAX_OCCURRENCE } from '../../constants';
import ConsumeChannel from './Consume';

/**
 * Class representing a consumer channel for processing sagas in a microservice environment.
 *
 */
export class SagaCommenceConsumeChannel extends ConsumeChannel {
    /**
     * The saga associated with the consumed message.
     */
    protected readonly saga: CommenceSaga<Record<string, any>>;

    /**
     * Constructs a new instance of the SagaCommenceConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {CommenceSaga} saga - The saga associated with the consumed message.
     */
    public constructor(
        channel: Channel,
        msg: ConsumeMessage,
        queueName: string,
        saga: CommenceSaga<Record<string, any>>
    ) {
        super(channel, msg, queueName);
        this.saga = saga;
    }

    /**
     * Method to acknowledge the message.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }

    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const hashId = this.getSagaHashId(`SagaCommenceConsumeChannel-${salt}`);
        return this.nackWithFibonacciStrategyHelper(maxOccurrence, hashId);
    }

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
