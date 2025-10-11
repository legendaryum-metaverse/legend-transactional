import { closeConsumeChannel } from './consumeChannel';
import { closeSendChannel } from '../Broker';
import { closeRabbitMQConn } from './start';
/**
 * Stop and clean up the RabbitMQ connections and channels used by the library.
 *
 * @returns {Promise<void>} A promise that resolves when RabbitMQ connections and channels are successfully closed.
 * @throws {Error} If there is an issue with closing the **_consume_** channel, send channel, or RabbitMQ connection.
 * @see closeConsumeChannel
 * @see closeSendChannel
 * @see closeRabbitMQConn
 */
export const stopRabbitMQ = async (): Promise<void> => {
  await closeConsumeChannel();
  await closeSendChannel();
  await closeRabbitMQConn();
};
