import { AvailableMicroservices, exchange, MicroserviceEvent, QueueConsumerProps } from '../@types';

const getQueueName = (microservice: AvailableMicroservices) => {
    return `${microservice}_saga_commands`;
};

export const getQueueConsumer = (microservice: AvailableMicroservices): QueueConsumerProps => {
    return {
        queueName: getQueueName(microservice),
        exchange: exchange.Commands
    };
};

export const getEventKey = (event: MicroserviceEvent) => {
    return event.toUpperCase();
};
export const getEventObject = (event: MicroserviceEvent) => {
    const key = getEventKey(event);
    return {
        [key]: event
    };
};
