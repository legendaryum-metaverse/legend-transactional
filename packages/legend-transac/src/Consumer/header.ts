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

        // GRAL: todos los exchanges a Matching
        await channel.assertExchange(ev, 'headers', { durable: true /*, arguments: args */ });
        await channel.bindExchange(ev, exchange.Matching, '', {
            ...args,
            m: 'normal',
            'x-match': 'all'
        });

        // el requeue no es para todos, es solo para el que puede hacer requeue
        await channel.assertExchange(`${ev}_requeue`, 'headers', { durable: true /*, arguments: args*/ });
        await channel.bindExchange(`${ev}_requeue`, exchange.MatchingRequeue, '', args);

        // TODO: los headers pueden ser un json
        if (events.includes(ev)) {
            // exchanges para el nacking
            await channel.assertExchange(`${ev}_${queueName}`, 'headers', {
                durable: true
                // arguments: { ...args, micros: queueName, 'x-match': 'all' }
            });
            await channel.bindExchange(`${ev}_${queueName}`, exchange.Matching, '', {
                ...args,
                micros: queueName,
                'x-match': 'all'
            });

            await channel.bindQueue(queueName, `${ev}_${queueName}`, '', {
                ...args,
                micros: queueName,
                'x-match': 'all'
            });

            await channel.bindQueue(queueName, ev, '', args);
            await channel.bindQueue(requeueQueue, `${ev}_requeue`, '', args);
        } else {
            // exchanges para el nacking
            await channel.deleteExchange(`${ev}_${queueName}`, { ifUnused: false });

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
