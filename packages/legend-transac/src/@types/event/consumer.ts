import { EventPayload, MicroserviceEvent } from './events';
import { EventsConsumeChannel } from '../../Consumer/channels/Events';
/**
 * Represents handlers for events emitted by a microservice.
 */
export interface EventsHandler<T extends MicroserviceEvent> {
  // Guard the index access so TS 5.9+ is satisfied without changing public API
  payload: EventPayload[T & keyof EventPayload];
  channel: EventsConsumeChannel;
}
/**
 * Represents the events emitted by a microservice to Legendaryum.
 */
export type MicroserviceConsumeEvents<T extends MicroserviceEvent> = {
  [key in T]: EventsHandler<key>;
};
