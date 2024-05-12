import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { EventsConsumeChannel } from '../channels/Events';
import { EventPayload, MicroserviceConsumeEvents, MicroserviceEvent } from '../../@types';
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
    const headers = msg.properties.headers;
    if (!headers || Object.values(headers).length === 0) {
        console.error('headers not AVAILABLE, is a headers exchange');
        return;
    }
    const allValues = Object.values(headers) as U[];
    if (allValues.length > 1) {
        console.warn('More than one header value');
        // aca es donde consumo, me deberia permitir recibir mensajes con mas de un header
        // pero sería raro un mismo payload para varios listeners,
        // cada evento se supone que es disitino, lo controlo en el payload de la funcion
        // que publique el mensaje
    }
    const stringPayload = msg.content.toString();
    let payload;
    try {
        payload = JSON.parse(stringPayload) as EventPayload[U];
    } catch (error) {
        console.error('ERROR PARSING MSG', error);
        channel.nack(msg, false, false);
        return;
    }
    const responseChannel = new EventsConsumeChannel(channel, msg, queueName, stringPayload);

    console.log(allValues);
    e.emit(allValues[0], { payload, channel: responseChannel });
};
