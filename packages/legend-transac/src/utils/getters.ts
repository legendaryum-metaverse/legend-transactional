import { AvailableMicroservices, exchange, QueueConsumerProps } from '../@types';

export const getQueueName = (microservice: AvailableMicroservices) => {
    return `${microservice}_saga_commands`;
};

export const getQueueConsumer = (microservice: AvailableMicroservices): QueueConsumerProps => {
    return {
        queueName: getQueueName(microservice),
        exchange: exchange.Commands
    };
};
