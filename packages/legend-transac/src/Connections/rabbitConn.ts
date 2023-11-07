import * as amqp from 'amqplib';
import amqplib, { Connection } from 'amqplib';

let conn: amqp.Connection | null = null;
let url: string | null = null;
let isTheConnectionClosed = true;
/**
 * Save the RabbitMQ URI for establishing a connection.
 *
 * @param {string} uri - The RabbitMQ URI to save.
 */
export const saveUri = (uri: string) => {
    if (!url) {
        url = uri;
    }
};
/**
 * Get the saved RabbitMQ URI.
 *
 * @returns {string} The saved RabbitMQ URI.
 * @throws {Error} If the RabbitMQ URI is not initialized.
 */
const getUri = (): string => {
    if (url === null) {
        throw new Error('RabbitMQ URI not initialized.');
    }
    return url;
};

const startListeners = (c: amqp.Connection) => {
    c.addListener('close', (e: Error) => {
        isTheConnectionClosed = true;
        console.error('[__Connection closed__]', e.message);
    });
    c.addListener('error', (e: Error) => {
        isTheConnectionClosed = true;
        console.error('[__Connection error__]', e.message);
    });
};

/**
 * Get the RabbitMQ connection or establish a new connection if not already connected.
 *
 * @returns {Promise<Connection>} A promise that resolves to the RabbitMQ connection.
 */
export const getRabbitMQConn = async (): Promise<Connection> => {
    if (conn === null) {
        conn = await amqplib.connect(getUri());
        isTheConnectionClosed = false;
        startListeners(conn);
    }
    return conn;
};
/**
 * Close the RabbitMQ connection if it is open.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successfully closed.
 */
export const closeRabbitMQConn = async (): Promise<void> => {
    if (conn !== null) {
        await conn.close();
        conn = null;
        url = null;
    }
};

/**
 * Checks the health of a RabbitMQ connection by creating a test channel and checking a queue.
 * @param {string} queue - The name of the queue to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the connection is healthy and the queue exists, or `false` otherwise.
 */
export const isConnectionHealthy = async (queue: string): Promise<boolean> => {
    let isHealthy = false;
    if (isTheConnectionClosed) return isHealthy;
    if (conn === null) return isHealthy;
    // si el check falla, se cierra la conexión:
    // https://github.com/amqp-node/amqplib/issues/649
    const closeListener = (e: Error) => {
        isTheConnectionClosed = true;
        console.error('[health_check_listener:__Connection closed__]', e.message);
    };

    const errorListener = (e: Error) => {
        isTheConnectionClosed = true;
        console.error('[health_check_listener:__Connection error__]', e.message);
    };

    conn.addListener('close', closeListener);
    conn.addListener('error', errorListener);
    const testChannel = await conn.createConfirmChannel();

    try {
        const testChannelPromise = new Promise<void>((resolve, reject) => {
            testChannel
                .checkQueue(queue)
                .then(() => {
                    // console.log('[Check success]', info);
                    isHealthy = true;
                    resolve();
                })
                .catch(e => {
                    console.error('[Check failed]', (e as Error).message);
                    reject(e);
                });
        });
        await testChannelPromise;
    } catch (e) {
        // si falla no es necesario cerrar el canal porque ya se cerró
        return isHealthy;
    }
    await testChannel.close();
    conn.removeListener('close', closeListener);
    conn.removeListener('error', errorListener);
    // success
    return isHealthy;
};
