import { EventPayload, exchange, MicroserviceEvent } from '../@types';
import { getEventObject } from '../utils';
import { getSendChannel } from './sendChannel';

export const publishEvent = async <T extends MicroserviceEvent>(msg: EventPayload[T], event: T) => {
    const channel = await getSendChannel();
    // Assert exchange, el mismo assert que en en el Consumer/header.ts
    await channel.assertExchange(exchange.Matching, 'headers', { durable: true });
    channel.publish(exchange.Matching, ``, Buffer.from(JSON.stringify(msg)), {
        headers: {
            ...getEventObject(event),
            // key para emitir eventos a todos los micros, todos los micros tienen el bind al exchange Matching
            'all-micro': 'yes'
        }
    });
};
