import { AvailableMicroservices } from '../microservices';
import { SagaStep } from './sagaStep';
import { MicroserviceConsumeChannel, SagaConsumeChannel } from '../../../Consumer';

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
