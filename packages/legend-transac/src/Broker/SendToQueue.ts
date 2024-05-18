import { CommenceSaga, queue, SagaCommencePayload, SagaTitle } from '../@types';
import { getSendChannel } from './sendChannel';

/**
 * Send a message payload to a specified queue.
 *
 * @param {string} queueName - The name of the queue to send the message to.
 * @param {Record<string, any>} payload - The message payload to send.
 * @throws {Error} If there is an issue with sending the message or creating the **_send_** channel.
 */
export const sendToQueue = async <T extends Record<string, any>>(queueName: string, payload: T): Promise<void> => {
    // any -> debido a que tiparlo para todos los payloads posibles es over-engineering
    const channel = await getSendChannel();
    await channel.assertQueue(queueName, { durable: true });

    // NB: `sentToQueue` and `publish` both return a boolean
    // indicating whether it's OK to send again straight away, or
    // (when `false`) that you should wait for the event `'drain'`
    // to fire before writing again. We're just doing the one write,
    // so we'll ignore it.
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
        persistent: true
    });
};
/**
 * Commence a saga by sending a message payload to the **_CommenceSaga_** queue.
 *
 * @typeparam T - The type of the message payload.
 * @param {string} sagaTitle - The name of the saga to commence.
 * @param {Record<string, unknown>} payload - The message payload to send.
 */
export const commenceSaga = async <U extends SagaTitle>(
    sagaTitle: U,
    payload: SagaCommencePayload[U]
): Promise<void> => {
    const saga: CommenceSaga<U> = {
        title: sagaTitle,
        payload
    };
    await sendToQueue(queue.CommenceSaga, saga);
};
