import { CommenceSagaEvents, CommenceSaga, SagaTitle } from '../../@types';
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
export const commenceSagaConsumeCallback = <U extends SagaTitle>(
  msg: ConsumeMessage | null,
  channel: Channel,
  e: Emitter<CommenceSagaEvents<U>>,
  queueName: string,
) => {
  if (!msg) {
    console.error('NO MSG AVAILABLE');
    return;
  }
  let saga;
  try {
    saga = JSON.parse(msg.content.toString()) as CommenceSaga<U>;
  } catch (error) {
    console.error('ERROR PARSING MSG', error);
    channel.nack(msg, false, false);
    return;
  }
  const responseChannel = new SagaCommenceConsumeChannel(channel, msg, queueName);

  e.emit(saga.title, { saga, channel: responseChannel });
};
