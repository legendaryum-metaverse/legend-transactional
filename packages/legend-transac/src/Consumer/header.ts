import { exchange } from '../@types/rabbit-mq';
import { getConsumeChannel } from '../Connections';
import { microserviceEvent, type MicroserviceEvent } from '../@types';
import { getEventObject } from '../utils';

/**
 * Configures RabbitMQ exchanges, queues, and bindings for consuming specific microservice events with requeue capabilities.
 *
 * This function is crucial for setting up the infrastructure to receive events from the RabbitMQ message broker. It establishes a flexible system for:
 *
 * 1. Routing events to specific microservices based on headers.
 * 2. Requeueing failed events for later processing.
 *
 * The function performs the following steps:
 *
 * **General Setup:**
 *   - Obtains a consume channel from RabbitMQ.
 *   - Asserts the `Matching` exchange where events will be initially published.
 *   - Asserts the `MatchingRequeue` exchange for handling requeued messages.
 *   - Asserts the main queue where events will be consumed (`queueName`). Is a specific queue for a microservice.
 *   - Asserts the requeue queue for storing messages that need to be reprocessed.
 *   - Sets up the requeue queue to send messages back to the `Matching` exchange if they remain unprocessed (dead-letter exchange mechanism).
 *
 * **Per-Event Configuration:**
 *   - Iterates through all possible `MicroserviceEvent` types.
 *   - Asserts event-specific exchanges (e.g., 'ORDER_CREATED', 'PAYMENT_FAILED').
 *   - Binds these event exchanges to the `Matching` exchange, allowing events to be routed based on headers.
 *   - Asserts requeue exchanges for each event type (e.g., 'ORDER_CREATED_requeue').
 *   - Binds requeue exchanges to the `MatchingRequeue` exchange, creating pathways for requeueing specific events.
 *
 * **Microservice-Specific Bindings:**
 *   - If the `events` array includes a specific event type:
 *     - The main queue (`queueName`) is bound to the event exchange, allowing the microservice to receive that event type.
 *     - The requeue queue is bound to the event's requeue exchange, setting up a mechanism for requeueing failed events back to the microservice.
 *     - An additional exchange is created for the microservice and the event, ensuring the requeued message is sent only to the microservice that originally failed to process it.
 *
 *   - If the `events` array doesn't include the event type:
 *     - Any existing bindings for that event type are removed.
 *     - The associated exchanges are deleted if they are no longer in use.
 *
 * **Concurrency Control:**
 *   - Sets the prefetch count to `1`, ensuring the microservice processes only one message at a time to maintain order and avoid race conditions.
 *
 * @param queueName - The name of the queue where the microservice will consume events. Is a specific queue for a microservice.
 * @param events - An array of `MicroserviceEvent` types that the microservice is interested in consuming.
 */
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
