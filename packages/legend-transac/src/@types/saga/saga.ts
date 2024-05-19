import { AvailableMicroservices } from '../microservices';
import { SagaStep } from './sagaStep';
import { CommandMap } from './commands';
import { SagaConsumeChannel } from '../../Consumer';

export interface SagaHandler<T extends AvailableMicroservices> {
    /**
     * The saga step associated with the event.
     */
    step: SagaStep<T>;
    /**
     * The channel used for consuming the event.
     */
    channel: SagaConsumeChannel<T>;
}
/**
 * Represents the saga step emitted from a specific microservice to the saga.
 */
export type SagaConsumeSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: SagaHandler<T>;
};
