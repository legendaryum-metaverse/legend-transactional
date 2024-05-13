import { ConsumeMessage } from 'amqplib';
import { MAX_NACK_RETRIES, NACKING_DELAY_MS } from '../constants';
import { getConsumeChannel } from '../Connections';
import { exchange } from '../@types';

/**
 * Apply delayed nack mechanism to a message, optionally retrying a limited number of times.
 *
 * @param {ConsumeMessage} msg - The message to be nacked.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 * @param {number} [delay=NACKING_DELAY_MS] - The delay in milliseconds before requeuing the message.
 * @param {number} [maxRetries=MAX_NACK_RETRIES] - The maximum number of nack retries allowed.
 * @returns {Promise<number>} The count of nack retries performed.
 * @throws {Error} If there are issues with the consume channel, publishing the message, or exceeding max retries.
 *
 * @example
 * const msg = ... // ConsumeMessage from RabbitMQ
 * const queueName = 'my_queue';
 * const delay = 5000; // 5 seconds
 * const maxRetries = 3;
 * const nackCount = await nackWithDelay(msg, queueName, delay, maxRetries);
 * console.log(`Message nacked with ${nackCount} retries`);
 *
 * @see MAX_NACK_RETRIES
 * @see NACKING_DELAY_MS
 * @see SagaConsumeChannel
 * @see MicroserviceConsumeChannel
 */
export const nackWithDelay = async (
    msg: ConsumeMessage,
    queueName: string,
    delay: number = NACKING_DELAY_MS,
    maxRetries: number = MAX_NACK_RETRIES
): Promise<number> => {
    const channel = await getConsumeChannel();
    channel.nack(msg, false, false); // nack without requeueing immediately

    let count = 1;
    // La estrategia de "count" se aplica con custom headers
    // https://github.com/rabbitmq/rabbitmq-server/issues/10709
    // https://github.com/spring-cloud/spring-cloud-stream/issues/2939
    if (msg.properties.headers && msg.properties.headers['x-retry-count']) {
        count = (msg.properties.headers['x-retry-count'] as number) + 1;
    }

    // Checkeo para verificar si cambia el x-death en futuros rabbits
    if (msg.properties.headers && msg.properties.headers['x-death'] && msg.properties.headers['x-death'].length > 1) {
        const logData = {
            'x-death': msg.properties.headers['x-death'],
            queueName,
            msg: msg.content.toString(),
            headers: msg.properties.headers
        };
        console.warn('x-death length > 1 -> TIME TO REFACTOR', logData);
    }

    if (count > maxRetries) {
        console.error(`MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`);
        // nada más que hacer, termina el proceso
        return maxRetries;
    }

    if (msg.fields.exchange === exchange.Matching) {
        if (msg.properties?.headers?.['all-micro']) {
            // importantísimo, el header que se borra es aquel que tiene todos los micros escuchando cierto evento, sino el nacking le llega a todos.
            delete msg.properties.headers['all-micro'];
        }
        // Viene de una nacking de eventos
        channel.publish(exchange.MatchingRequeue, ``, msg.content, {
            expiration: delay,
            headers: {
                ...msg.properties.headers,
                // el nacking es dirigido a un microservicio en particular, el que nackeó.
                micro: queueName,
                // persisto la cuenta de nacks
                'x-retry-count': count
            },
            persistent: true
        });
    } else {
        // destinado al Saga
        channel.publish(exchange.Requeue, `${queueName}_routing_key`, msg.content, {
            expiration: delay,
            headers: { ...msg.properties.headers, 'x-retry-count': count },
            persistent: true
        });
    }

    return count;
};
/*
Se puede dar muchos nackings, para el mismo event, nada garantiza el orden de llegada, se podría implementar una solución con versionado en la bd en ambas tablas.
TODO: Se puede enviar eventos en el publish, siempre con headers
{
  "ORDERS.PAY": "orders.pay",
  // "TICKET.START": "ticket.start", -> agregar uno más causa que se eliga el primero que se detecto, lo mejor sería emitir a todos!
  "all-micro": "yes",
}

* */
