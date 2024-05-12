import { MAX_OCCURRENCE } from '../../constants';
import ConsumeChannel from './Consume';
import crypto from 'crypto';
import { Channel, ConsumeMessage } from 'amqplib';

/**
 * Represents a **_consume_** channel for handling saga events/commands.
 * Extends the abstract ConsumeChannel class.
 *
 */
export class EventsConsumeChannel extends ConsumeChannel {
    /**
     * The payload associated with the consumed message.
     */
    private readonly payload: string;

    /**
     * Constructs a new instance of the SagaCommenceConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {string} payload - The payload associated with the consumed message.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, payload: string) {
        super(channel, msg, queueName);
        this.payload = payload;
    }

    /**
     * Acknowledges the consumed saga event/command.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }

    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const hashId = this.getHashId(`EventsConsumeChannel-${salt}`);
        return this.nackWithFibonacciStrategyHelper(maxOccurrence, hashId);
    }

    /**
     * Method to get the hash id of a saga.
     * The hash id is used to identify a saga in the saga occurrence map.
     *
     * @param {string} salt - The salt to use for hashing the saga.
     * @returns {string} The hash id of the saga.
     */
    private getHashId = (salt: string): string => {
        const hash = crypto.createHash('sha256');
        hash.update(`${this.payload}-${salt}`);
        return hash.digest('hex').slice(0, 10);
    };
}
