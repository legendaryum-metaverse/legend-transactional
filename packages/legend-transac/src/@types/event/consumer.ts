import { EventPayload, MicroserviceEvent } from './events';
import { EventsConsumeChannel } from '../../Consumer/channels/Events';

export interface EventsHandler<T extends MicroserviceEvent> {
    payload: EventPayload[T];
    channel: EventsConsumeChannel;
}

/**
 * Represents the events emitted by a microservice to Legendaryum.
 */
export type MicroserviceConsumeEvents<T extends MicroserviceEvent> = {
    [key in T]: EventsHandler<key>;
};
