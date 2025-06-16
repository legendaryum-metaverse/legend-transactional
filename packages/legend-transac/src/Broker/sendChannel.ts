import { getRabbitMQConn } from '../Connections';
import { Channel } from 'amqplib';

let sendChannel: Channel | null = null;
/**
 * Get the **_send_** channel for sending messages to a queue.
 *
 * @returns {Promise<Channel>} A promise that resolves to the **_send_** channel.
 * @throws {Error} If there is an issue with creating the **_send_** channel or getting the RabbitMQ connection.
 */
export const getSendChannel = async (): Promise<Channel> => {
  if (sendChannel === null) {
    sendChannel = await (await getRabbitMQConn()).createChannel();
  }
  return sendChannel;
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
