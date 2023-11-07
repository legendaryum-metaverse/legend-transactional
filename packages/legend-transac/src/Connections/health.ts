import amqplib from 'amqplib';
import { getRabbitMQConn } from './rabbitConn';

/**
 * Checks the health of a RabbitMQ queue.
 * @param {string} queue - The name of the queue to check.
 * @param {number} [closeTestChannelTimeoutMs=2000] - The timeout in milliseconds for closing the test channel.
 * @param {amqplib.Connection} [conn] - Optional pre-existing RabbitMQ connection.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the queue is healthy, or `false` otherwise.
 */
export const isQueueHealthy = async (
    queue: string,
    closeTestChannelTimeoutMs: number = 2000,
    conn?: amqplib.Connection
): Promise<boolean> => {
    let connection = conn;
    if (!connection) {
        connection = await getRabbitMQConn();
    }
    const testChannel = await connection.createChannel();
    let isHealthy = false;

    const timeoutPromise = new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, closeTestChannelTimeoutMs);
    });
    const waitForChannelToClose = new Promise<void>(resolve => {
        testChannel.once('close', () => {
            resolve();
        });
    });
    try {
        await testChannel.checkQueue(queue);
        isHealthy = true;
    } catch (e) {
        //
    } finally {
        try {
            void testChannel.close();
            await Promise.race([waitForChannelToClose, timeoutPromise]);
        } catch (e) {
            //
        }
    }
    return isHealthy;
};
