import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter, EventType } from 'mitt';
import { getConsumeChannel } from '../Connections';
/**
 * Consume messages from a specified queue and process them using the provided callback function.
 *
 * @param {Emitter<E>} e - An emitter to listen to events related to the consumed messages with The event type(s) associated with the consumed messages.
 * @param {string} queueName - The name of the queue to consume messages from.
 * @param {(msg: ConsumeMessage | null, channel: Channel, e: Emitter<E>, queueName: string) => void} cb - The callback function to process consumed messages.
 * @throws {Error} If there is an issue with establishing the consume channel or consuming messages.
 *
 * @typeParam E - The event type(s) associated with the consumed messages.
 */
export const consume = async <E extends Record<EventType, unknown>>(
    e: Emitter<E>,
    queueName: string,
    cb: (msg: ConsumeMessage | null, channel: Channel, e: Emitter<E>, queueName: string) => void
): Promise<void> => {
    // Establish a consume channel and event emitter.
    const channel = await getConsumeChannel();
    // Consume messages from the specified queue and process using the provided callback function.
    await channel.consume(
        queueName,
        msg => {
            cb(msg, channel, e, queueName);
        },
        {
            exclusive: false,
            noAck: false
        }
    );
};
