import { exchange } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
import { microserviceEvent, type MicroserviceEvent } from '../@types';
import { getEventObject } from '../utils';

export const createHeaderConsumers = async (queueName: string, events: MicroserviceEvent[]) => {
    // TODO: el mismo channel?, capaz un distinto, si se bloquea el saga no tendría que bloquear el events
    const channel = await getConsumeChannel();

    const requeueQueue = `${queueName}_matching_requeue`;

    // Assert exchange and queue for the consumer.
    // await channel.deleteExchange(consumerExchange, { ifUnused: false });
    await channel.assertExchange(exchange.Matching, 'headers', { durable: true });
    // Set up requeue mechanism by creating a requeue exchange and binding requeue queue to it.
    await channel.assertExchange(exchange.MatchingRequeue, 'headers', { durable: true });

    await channel.assertQueue(queueName, { durable: true });

    await channel.assertQueue(requeueQueue, {
        durable: true,
        arguments: { 'x-dead-letter-exchange': exchange.Matching }
    });

    for (const ev of Object.values(microserviceEvent)) {
        const args = getEventObject(ev);

        await channel.assertExchange(ev, 'headers', { durable: true, arguments: args });
        await channel.bindExchange(ev, exchange.Matching, '', args);

        await channel.assertExchange(`${ev}_requeue`, 'headers', { durable: true, arguments: args });
        await channel.bindExchange(`${ev}_requeue`, exchange.MatchingRequeue, '', args);

        if (events.includes(ev)) {
            await channel.bindQueue(queueName, ev, '', args);
            await channel.bindQueue(requeueQueue, `${ev}_requeue`, '', args);
        } else {
            await channel.unbindQueue(queueName, ev, '', args);
            await channel.unbindQueue(requeueQueue, `${ev}_requeue`, '', args);
        }
    }

    // Set the prefetch count to process only one message at a time to maintain order and control concurrency.
    await channel.prefetch(1); // process only one message at a time
    // await channel.consume(
    //     queueName,
    //     message => {
    //         console.log('AA:', message);
    //         console.log(message.content.toString());
    //     },
    //     { noAck: true }
    // );
};
