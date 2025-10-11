import { Channel, ConsumeMessage } from 'amqplib';
import { Emitter } from 'mitt';
import { EventsConsumeChannel } from '../channels/Events';
import { EventPayload, MicroserviceConsumeEvents, microserviceEvent, MicroserviceEvent } from '../../@types';
import { publishAuditEvent } from '../../Broker/PublishAuditEvent';
import { extractMicroserviceFromQueue } from '../../utils';
import { v7 as uuidv7 } from 'uuid';

/**
 * Callback function for consuming and handling microservice events.
 *
 * This function is responsible for:
 *   1. Parsing the incoming event message from the RabbitMQ queue.
 *   2. Identifying the specific event type from message headers.
 *   3. Emitting the event along with its payload to the provided emitter.
 *
 * If there are errors during message parsing or if invalid headers are found, the message is negatively acknowledged (NACKed) without requeueing.
 *
 * @template U - The specific type of microservice event being handled. Must be one of the types defined in the `MicroserviceEvent` enum.
 *
 * @param {ConsumeMessage | null} msg - The consumed message from RabbitMQ. Can be `null` if no message was available.
 * @param {Channel} channel - The RabbitMQ channel used for consuming messages. This is used to acknowledge or reject messages.
 * @param {Emitter<MicroserviceConsumeEvents<U>>} e - An event emitter that will broadcast the parsed event and its payload.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 */
export const eventCallback = <U extends MicroserviceEvent>(
  msg: ConsumeMessage | null,
  channel: Channel,
  e: Emitter<MicroserviceConsumeEvents<U>>,
  queueName: string,
) => {
  if (!msg) {
    console.error('mgs not AVAILABLE');
    return;
  }

  // message parsing
  const stringPayload = msg.content.toString();
  let payload;
  try {
    // Constrain the index access to valid keys to satisfy TS 5.9+
    payload = JSON.parse(stringPayload) as EventPayload[U & keyof EventPayload];
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
      { headersReceived: headers, eventsDetected: event },
    );
  }

  // Emit audit.received event BEFORE processing (automatic audit tracking)
  // This tracks when an event is received by a microservice before processing starts
  const receiverMicroservice = extractMicroserviceFromQueue(queueName);
  const receivedEvent = event[0];
  const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds

  let event_id = msg.properties.messageId;

  if (!event_id) {
    console.warn('Message is missing messageId, generating a new UUID v7 for event_id');
    event_id = uuidv7();
  }

  // Extract publisher microservice from message properties (set by the publisher)
  const publisherMicroservice = msg.properties.appId || 'unknown';

  //fire-and-forget -> Emit the audit.received event (never fail the main flow if audit fails)
  publishAuditEvent(channel, 'audit.received', {
    publisher_microservice: publisherMicroservice,
    receiver_microservice: receiverMicroservice,
    received_event: receivedEvent,
    received_at: timestamp,
    queue_name: queueName,
    event_id,
  }).catch((error) => {
    console.error('Failed to emit audit.received event:', error);
  });

  const responseChannel = new EventsConsumeChannel(
    channel,
    msg,
    queueName,
    receiverMicroservice,
    receivedEvent,
    event_id,
    publisherMicroservice,
  );

  // si event.length > 1, a esta altura todos los eventos son válidos y se pueden emitir. Recordar llego un solo mensaje con extra headers.
  // Sin embargo, el payload es tipado para cada evento.
  // Mismo payload para dos handlers distintos, a menos que la relación con el evento en el proceso sea importante se podría refactorizar
  e.emit(event[0], { payload, channel: responseChannel });
};
