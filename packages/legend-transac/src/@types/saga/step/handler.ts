import { AvailableMicroservices } from '../microservices';
import { SagaCommenceConsumeChannel } from '../../../Consumer/channels/CommenceSaga';
import { SagaStep } from './sagaStep';
import { CommenceSaga } from '../saga';
import { MicroserviceConsumeChannel, SagaConsumeChannel } from '../../../Consumer';

export interface MicroserviceHandler<T extends AvailableMicroservices> {
    /**
     * The ID of the saga associated with the event.
     */
    sagaId: number;
    /**
     * The payload associated with the event.
     */
    payload: Record<string, any>;
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

export interface CommenceSagaHandler<T = any> {
    /**
     * The saga associated with the event.
     */
    saga: CommenceSaga<T>;
    /**
     * The channel used for consuming the event.
     */
    channel: SagaCommenceConsumeChannel;
}
