import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { EventsConsumeChannel } from '../channels/Events';
import { EventPayload, MicroserviceConsumeEvents, microserviceEvent, MicroserviceEvent } from '../../@types';
/**
 * Callback function for consuming microservice events/commands.
 *
 * @typeparam T - The type of available microservices.
 *
 * @param {ConsumeMessage | null} msg - The consumed message.
 * @param {Channel} channel - The channel used for consuming messages.
 * @param {Emitter<MicroserviceConsumeSagaEvents<T>>} e - The emitter to emit events.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 */
export const eventCallback = <U extends MicroserviceEvent>(
    msg: ConsumeMessage | null,
    channel: Channel,
    e: Emitter<MicroserviceConsumeEvents<U>>,
    queueName: string
) => {
    if (!msg) {
        console.error('mgs not AVAILABLE');
        return;
    }

    // message parsing
    const stringPayload = msg.content.toString();
    let payload;
    try {
        payload = JSON.parse(stringPayload) as EventPayload[U];
    } catch (error) {
        console.error('ERROR PARSING MSG', error);
        channel.nack(msg, false, false);
        return;
    }

    // finding the event key
    const headers = msg.properties.headers;
    if (!headers || Object.values(headers).length === 0) {
        console.error('headers not AVAILABLE, is a headers exchange');
        channel.nack(msg, false, false);
        return;
    }
    const allValues = Object.values(headers) as unknown[];
    const event: U[] = [];
    for (const value of allValues) {
        if (typeof value === 'string' && Object.values(microserviceEvent).includes(value as MicroserviceEvent)) {
            event.push(value as U);
        }
    }
    if (event.length === 0) {
        console.error('Invalid header value', headers);
        channel.nack(msg, false, false);
        return;
    }
    if (event.length > 1) {
        console.error(
            'More then one valid header, using the first one detected, that is because the payload is typed with a particular event',
            { headersReceived: headers, eventsDetected: event }
        );
    }

    const responseChannel = new EventsConsumeChannel(channel, msg, queueName, stringPayload);

    // si event.length > 1, a esta altura todos los eventos son válidos y se pueden emitir. Recordar llego un solo mensaje con extra headers.
    // Sin embargo, el payload es tipado para cada evento.
    // Mismo payload para dos handlers distintos, a menos que la relación con el evento en el proceso sea importante se podría refactorizar
    e.emit(event[0], { payload, channel: responseChannel });
};
