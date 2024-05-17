import { CommenceSagaEvents, CommenceSaga } from '../../@types';
import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { SagaCommenceConsumeChannel } from '../channels/CommenceSaga';
/**
 * Callback function for consuming a saga commence event.
 *
 * @param {ConsumeMessage | null} msg - The consumed message.
 * @param {Channel} channel - The channel used for consuming messages.
 * @param {Emitter<CommenceSagaEvents>} e - The emitter to emit events.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 */
export const commenceSagaConsumeCallback = (
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<CommenceSagaEvents>,
    queueName: string
) => {
    if (!msg) {
        console.error('NO MSG AVAILABLE');
        return;
    }
    let saga: CommenceSaga<Record<string, any>>;
    try {
        saga = JSON.parse(msg.content.toString()) as CommenceSaga<Record<string, any>>;
    } catch (error) {
        console.error('ERROR PARSING MSG', error);
        channel.nack(msg, false, false);
        return;
    }
    const responseChannel = new SagaCommenceConsumeChannel(channel, msg, queueName);

    e.emit(saga.title, { saga, channel: responseChannel });
};
