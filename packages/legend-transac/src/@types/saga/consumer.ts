import { AvailableMicroservices } from './microservices';
import { CommandMap } from './commands';
import { SagaTitle } from './saga';
import { CommandHandler, CommenceSagaHandler, SagaHandler } from './step';

/**
 * Represents the events emitted by a consumer for a specific microservice.
 */
export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: CommandHandler<T>;
};
/**
 * Represents the saga title emitted by a consumer to commence a saga.
 */
export type ConsumerCommenceSaga = {
    [key in SagaTitle]: CommenceSagaHandler;
};
/**
 * Represents the saga events/events/step/command emitted by a consumer from a specific microservice to the saga.
 */
export type ConsumerSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: SagaHandler<T>;
};
