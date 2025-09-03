import { EventPayload, exchange, MicroserviceEvent } from '../@types';
import { getEventObject } from '../utils';
import { getSendChannel } from './sendChannel';
/**
 * Publishes a microservice event to all subscribed microservices.
 *
 * @template T - The type of the microservice event being published. Must extend `MicroserviceEvent`.
 * @param msg - The event payload data. The structure should match the expected payload for the event type (`T`).
 * @param event - The event identifier (e.g., 'ORDER_CREATED', 'PAYMENT_FAILED'). This must be one of the predefined event types in your `MicroserviceEvent` enum.
 * @async
 * @returns A Promise that resolves when the event has been successfully published.
 *
 * @example
 * ```typescript
 * import { publishEvent } from './publishEvent';
 * import { MicroserviceEvent } from '../@types';
 *
 * const orderData = { id: 123, customer: 'John Doe', total: 99.99 };
 * await publishEvent(orderData, MicroserviceEvent.ORDER_CREATED);
 * ```
 *
 * @see MicroserviceEvent
 */
export const publishEvent = async <T extends MicroserviceEvent>(
  msg: EventPayload[T & keyof EventPayload],
  event: T,
) => {
  const channel = await getSendChannel();
  // Assert exchange, el mismo assert que en en el Consumer/header.ts
  await channel.assertExchange(exchange.Matching, 'headers', { durable: true });
  channel.publish(exchange.Matching, ``, Buffer.from(JSON.stringify(msg)), {
    headers: {
      ...getEventObject(event),
      // key para emitir eventos a todos los micros, todos los micros tienen el bind al exchange Matching
      'all-micro': 'yes',
    },
  });
};
