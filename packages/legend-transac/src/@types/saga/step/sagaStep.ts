import { Status } from './status';
import { AvailableMicroservices } from '../microservices';
import { CommandMap, MicroserviceCommand } from '../commands';

/**
 * Represents the default properties of a saga step.
 */
export interface SagaStepDefaults {
    /**
     * The status of the saga step.
     */
    status: Status;
    /**
     * The payload associated with the saga step.
     */
    payload: Record<string, unknown>;
    /**
     * The previous payload of the saga step.
     */
    previousPayload: Record<string, unknown>;
    /**
     * Indicates if the step is the current active step.
     */
    isCurrentStep: boolean;
}

/**
 * Represents a saga step for a specific microservice.
 */
export interface SagaStep<T extends AvailableMicroservices> extends SagaStepDefaults, MicroserviceCommand<T> {
    /**
     * The microservice associated with the step.
     */
    microservice: T;
    /**
     * The command type based on the microservice, ensuring correctness.
     */
    command: CommandMap[T];
    /**
     * The status of the saga step.
     */
    status: Status;
    /**
     * The ID of the saga.
     */
    sagaId: number;
    /**
     * The payload associated with the saga step.
     */
    payload: Record<string, unknown>;
    /**
     * The previous payload of the saga step.
     */
    previousPayload: Record<string, unknown>;
    /**
     * Indicates if the step is the current active step.
     */
    isCurrentStep: boolean;
}
