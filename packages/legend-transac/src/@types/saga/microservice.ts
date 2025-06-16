import { AvailableMicroservices } from '../microservices';
import { CommandMap } from './commands';
import { MicroserviceConsumeChannel } from '../../Consumer';

export interface MicroserviceHandler<T extends AvailableMicroservices> {
  /**
   * The ID of the saga associated with the event.
   */
  sagaId: number;
  /**
   * The payload associated with the event.
   */
  payload: Record<string, unknown>;
  /**
   * The channel used for consuming the event.
   */
  channel: MicroserviceConsumeChannel<T>;
}

/**
 * Represents the events emitted by the saga to the microservices.
 */
export type MicroserviceConsumeSagaEvents<T extends AvailableMicroservices> = {
  [key in CommandMap[T]]: MicroserviceHandler<T>;
};
