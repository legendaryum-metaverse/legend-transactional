import { AvailableMicroservices } from './microservices';
import { CommandMap } from './commands';
import { SagaTitle } from './saga';
import { MicroserviceHandler, CommenceSagaHandler, SagaHandler } from './step';

/**
 * Represents the events emitted by the saga to the microservices.
 */
export type MicroserviceConsumeSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: MicroserviceHandler<T>;
};
/**
 * Represents the saga title emitted to commence a saga.
 */
export type CommenceSagaEvents = {
    [key in SagaTitle]: CommenceSagaHandler;
};
/**
 * Represents the saga step emitted from a specific microservice to the saga.
 */
export type SagaConsumeSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: SagaHandler<T>;
};
