import { getRabbitMQConn, prepare } from '../Connections';
import { Channel } from 'amqplib';
import { CommenceSaga, exchange, MicroserviceEvent, queue, SagaTitle } from '../@types';
import { getEventObject } from '../utils';

let sendChannel: Channel | null = null;
/**
 * Get the **_send_** channel for sending messages to a queue.
 *
 * @returns {Promise<Channel>} A promise that resolves to the **_send_** channel.
 * @throws {Error} If there is an issue with creating the **_send_** channel or getting the RabbitMQ connection.
 */
const getSendChannel = async (): Promise<Channel> => {
    if (sendChannel === null) {
        sendChannel = await (await getRabbitMQConn()).createChannel();
    }
    return sendChannel;
};
/**
 * Send a message payload to a specified queue.
 *
 * @param {string} queueName - The name of the queue to send the message to.
 * @param {Record<string, any>} payload - The message payload to send.
 * @throws {Error} If there is an issue with sending the message or creating the **_send_** channel.
 */
export const sendToQueue = async <T extends Record<string, any>>(queueName: string, payload: T): Promise<void> => {
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
 * @param {Record<string, any>} payload - The message payload to send.
 */
export const commenceSaga = async <T extends Record<string, any>>(sagaTitle: SagaTitle, payload: T): Promise<void> => {
    const saga: CommenceSaga<T> = {
        title: sagaTitle,
        payload
    };
    await sendToQueue(queue.CommenceSaga, saga);
};
/**
 * Close the **_send_** channel if it is open.
 *
 * @returns {Promise<void>} A promise that resolves when the **_send_** channel is successfully closed.
 * @throws {Error} If there is an issue with closing the **_send_** channel.
 */
export const closeSendChannel = async (): Promise<void> => {
    if (sendChannel !== null) {
        await sendChannel.close();
        sendChannel = null;
    }
};

export const publishEvent = async (msg: Record<string, unknown>, event: MicroserviceEvent) => {
    const channel = await getSendChannel();
    channel.publish(exchange.Matching, ``, Buffer.from(JSON.stringify(msg)), {
        headers: getEventObject(event)
    });
};

const exe = async () => {
    await prepare('amqp://rabbit:1234@localhost:5672');
    const msg = { name: 'test' };
    await publishEvent(msg, 'orders.pay');
};
// exe();
