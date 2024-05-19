import { CommenceSaga, queue, SagaCommencePayload, SagaTitle } from '../@types';
import { getSendChannel } from './sendChannel';
/**
 * Sends a message payload to a specified queue.
 *
 * @template T - The type of the message payload. This allows for type-safe handling of different payloads across queues.
 * @param {string} queueName - The name of the queue to send the message to.
 * @param {T} payload - The message payload to send.
 * @async
 * @returns {Promise<void>} A promise that resolves when the message has been successfully sent.
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
 * Commences a saga by sending a message payload to the `CommenceSaga` queue.
 *
 * Sagas are long-running processes composed of multiple steps, typically coordinated across services. This function initiates a new saga instance.
 *
 * @template U - The specific type of the saga being commenced. This must be one of the predefined types in the `SagaTitle` enum.
 * @param {U} sagaTitle - The title of the saga to commence. This acts as an identifier for the specific saga workflow.
 * @param {SagaCommencePayload[U]} payload - The payload data required to start the saga. The structure of this payload is specific to the saga type `U`.
 * @async
 * @returns {Promise<void>} A promise that resolves when the saga commencement message has been successfully sent to the queue.
 *
 * @see SagaTitle
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
