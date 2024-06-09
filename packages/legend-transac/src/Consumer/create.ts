import { QueueConsumerProps, exchange } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
/**
 * Create consumers for specified queues, bind them to exchanges, and set up requeue mechanism.
 *
 * @param {QueueConsumerProps[]} consumers - An array of queue consumer properties to set up consumers for.
 * @throws {Error} If there are issues with establishing the consume channel, creating queues, or binding exchanges.
 *
 * @example
 * const consumers = [
 *     {
 *         queueName: 'my_queue',
 *         exchange: Exchange.Commands
 *     },
 *     // Add more queue consumers here...
 * ];
 * await createConsumers(consumers);
 *
 * // Once consumers are set up, they will start processing messages.
 * @see startGlobalSagaStepListener
 * @see connectToSagaCommandEmitter
 */
export const createConsumers = async (consumers: QueueConsumerProps[]) => {
    const channel = await getConsumeChannel();

    // Iterate through the list of consumers and set up necessary configurations.
    for await (const consumer of consumers) {
        const { exchange: consumerExchange, queueName } = consumer;
        const requeueQueue = `${queueName}_requeue`;
        const routingKey = `${queueName}_routing_key`;

        // Assert exchange and queue for the consumer.
        await channel.assertExchange(consumerExchange, 'direct', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, consumerExchange, routingKey);

        // Set up requeue mechanism by creating a requeue exchange and binding requeue queue to it.
        await channel.assertExchange(exchange.Requeue, 'direct', { durable: true });
        await channel.assertQueue(requeueQueue, {
            durable: true,
            arguments: { 'x-dead-letter-exchange': consumerExchange }
        });
        await channel.bindQueue(requeueQueue, exchange.Requeue, routingKey);
    }
};
