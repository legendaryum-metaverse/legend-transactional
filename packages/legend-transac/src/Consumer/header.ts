import { exchange } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
import { microserviceEvent, type MicroserviceEvent } from '../@types';
import { getEventObject } from '../utils';

export const createHeaderConsumers = async (queueName: string, events: MicroserviceEvent[]) => {
    const channel = await getConsumeChannel();

    const requeueQueue = `${queueName}_matching_requeue`;

    // Assert exchange and queue for the consumer.
    await channel.assertExchange(exchange.Matching, 'headers', { durable: true });
    // Set up requeue mechanism by creating a requeue exchange and binding requeue queue to it.
    await channel.assertExchange(exchange.MatchingRequeue, 'headers', { durable: true });

    await channel.assertQueue(queueName, { durable: true });

    await channel.assertQueue(requeueQueue, {
        durable: true,
        arguments: { 'x-dead-letter-exchange': exchange.Matching }
    });

    for (const ev of Object.values(microserviceEvent)) {
        const headerEvent = getEventObject(ev);

        // GENARAL: exchange de un evento en particular con bind al exchange Matching-> acá se envía los eventos y luego
        // el exchange-Matching los rutea a exchange-ev de acuerdo a los argumentos
        await channel.assertExchange(ev, 'headers', { durable: true });
        await channel.bindExchange(ev, exchange.Matching, '', {
            ...headerEvent,
            // key para emitir eventos a todos lo micros, todos los micros tienen el bind a este exchange "ev"
            'all-micro': 'yes',
            'x-match': 'all' // se tienen que cumplir todos los argumentos
        });

        // GENARAL: exchange del requeue de un evento en particular con bind al exchange MatchingRequeue-> acá se envía los nackings de eventos y luego se rutea a `${ev}_requeue`
        await channel.assertExchange(`${ev}_requeue`, 'headers', { durable: true });
        // MatchingRequeue no necesita arguments adicionales, cuando MatchingRequeue, rutee a `${ev}_requeue`, `${ev}_requeue` tiene el bind a requeueQueue
        // con los argumentos necesarios para el nacking particular de cierto micro en lugar de nackear a todos los micros debido a un nacking en particular ocurrido
        // en cierto micro.
        await channel.bindExchange(`${ev}_requeue`, exchange.MatchingRequeue, '', headerEvent);

        // asignando/actualizando recursos de acuerdo a los eventos particulares de un microservicio
        const headersArgs = {
            ...headerEvent,
            micro: queueName,
            'x-match': 'all'
        } as const;
        if (events.includes(ev)) {
            // todos los micros tienen el bind a este exchange "ev"
            await channel.bindQueue(queueName, ev, '', headerEvent);
            // el requeue es a un micro en particular, el que hizo el nacking

            await channel.bindQueue(requeueQueue, `${ev}_requeue`, '', headersArgs);

            // cunado se realiza el nacking/publish a MatchingRequeue y luego que este rutea a `${ev}_requeue` tomando en cuenta los
            // args necesarios, volverá al exchange Matching, en el nacking se borra el header  'all-micro': 'yes', para que el nacking
            // sea dirigido a un micro en particular. "micros": "queueName" -> el que hizo el nacking
            await channel.assertExchange(`${ev}_${queueName}`, 'headers', {
                durable: true
            });
            await channel.bindExchange(`${ev}_${queueName}`, exchange.Matching, '', headersArgs);

            await channel.bindQueue(queueName, `${ev}_${queueName}`, '', headersArgs);
        } else {
            await channel.unbindQueue(queueName, ev, '', headerEvent);
            await channel.unbindQueue(requeueQueue, `${ev}_requeue`, '', headersArgs);
            await channel.deleteExchange(`${ev}_${queueName}`, { ifUnused: false });
        }
    }

    // Set the prefetch count to process only one message at a time to maintain order and control concurrency.
    await channel.prefetch(1); // process only one message at a time
};
