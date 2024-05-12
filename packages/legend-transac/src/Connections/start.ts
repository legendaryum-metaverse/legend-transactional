import {
    MicroserviceConsumeSagaEvents,
    SagaConsumeSagaEvents,
    exchange,
    queue,
    AvailableMicroservices,
    CommenceSagaEvents,
    MicroserviceEvent,
    MicroserviceConsumeEvents
} from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import {
    commenceSagaConsumeCallback,
    consume,
    createConsumers,
    createHeaderConsumers,
    sagaStepCallback,
    sagaConsumeCallback,
    eventCallback
} from '../Consumer';
import { getQueueConsumer } from '../utils';
import mitt, { Emitter } from 'mitt';
/**
 * Prepare the library for consuming messages by saving the RabbitMQ URI, establishing a connection,
 * and getting the **_consume_** channel.
 *
 * @param {string} url - The RabbitMQ URL to establish a connection.
 * @throws {Error} If there is an issue with saving the URI, establishing a connection, or getting the consume channel.
 * @see saveUri
 * @see getRabbitMQConn
 * @see getConsumeChannel
 */
export const prepare = async (url: string) => {
    saveUri(url);
    await getRabbitMQConn();
    await getConsumeChannel();
};
/**
 * Start a global saga listener to handle incoming saga events/commands from all microservices.
 *
 * @returns {Promise<Emitter>} Emitter<ConsumerSagaEvents<T>> - A promise that resolves to an emitter
 * for handling the saga events emitted by the specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T
 * @example
 * const url = 'amqp://localhost';
 * await prepare();
 * const sagaEmitter = await startGlobalSagaListener<AvailableMicroservices>();
 * // Also valid and equivalent to the above
 * const g = await startGlobalSagaListener();
 *
 * // Listen to a single microservice saga event
 * g.on(MintCommands.MintImage, async ({ channel, step }) => {
 *      // ... do something, ack or nack the message
 * });
 *
 * // Listen to all microservice saga events, take notice that the event already listen above it needs to be ignored here.
 * g.on('*', async (command, { step, channel }) => {
 *     if (command === MintCommands.MintImage) {
 *         // Ignore the event already listened above
 *         return;
 *     }
 *     // ... do something ack or nack if there are commands that are not handled
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see prepare
 * @see startSaga
 * @see connectToSagaCommandEmitter
 * @see commenceSagaListener
 */
export const startGlobalSagaStepListener = async <T extends AvailableMicroservices>(): Promise<
    Emitter<SagaConsumeSagaEvents<T>>
> => {
    const queueO = {
        queueName: queue.ReplyToSaga,
        exchange: exchange.ReplyToSaga
    };
    const e = mitt<SagaConsumeSagaEvents<T>>();
    await createConsumers([queueO]);
    void consume<SagaConsumeSagaEvents<T>>(e, queueO.queueName, sagaConsumeCallback);
    return e;
};
/**
 * Start a saga listener to handle incoming **commence saga events**
 *
 * @returns {Promise<Emitter>} Emitter<ConsumerCommenceSaga<T>> - A promise that resolves to an emitter
 * for handling the saga emitted to commence a saga.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @example
 * const url = 'amqp://localhost';
 * await prepare();
 * const c = await commenceSagaListener();
 *
 * // Listen to a single saga commence event
 * c.on(sagaTitle.RechargeBalance, async ({ saga, channel }) => {
 *      // ... start the saga
 * });
 *
 * // Listen to all saga events, take notice that the event already listen above it needs to be ignored here.
 * c.on('*', async (sagaTitle, { saga, channel }) => {
 *     if (sagaTitle === sagaTitle.RechargeBalance) {
 *         // Ignore the event already listened above
 *         return;
 *     }
 *     // ... start the sagas
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see prepare
 * @see startSaga
 * @see connectToSagaCommandEmitter
 * @see startGlobalSagaStepListener
 */
export const commenceSagaListener = async (): Promise<Emitter<CommenceSagaEvents>> => {
    const q = {
        queueName: queue.CommenceSaga,
        exchange: exchange.CommenceSaga
    };
    const e = mitt<CommenceSagaEvents>();
    await createConsumers([q]);
    void consume<CommenceSagaEvents>(e, q.queueName, commenceSagaConsumeCallback);
    return e;
};
/**
 * Connects to the saga listeners.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @returns {Promise} - An object containing the saga listeners.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @example
 * const url = 'amqp://localhost';
 * const {
 *         globalSagaStepListener: g,
 *         commenceSagaListener: c
 *     } = await startSaga(url);
 * // Start listening to the saga events/commands
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see startGlobalSagaStepListener
 * @see commenceSagaListener
 */
export const startSaga = async <T extends AvailableMicroservices>(
    url: string
): Promise<{
    globalSagaStepListener: Emitter<SagaConsumeSagaEvents<T>>;
    commenceSagaListener: Emitter<CommenceSagaEvents>;
}> => {
    await prepare(url);
    const g = await startGlobalSagaStepListener<T>();
    const c = await commenceSagaListener();
    return {
        globalSagaStepListener: g,
        commenceSagaListener: c
    };
};

/**
 * Connects to a specific microservice's saga command emitter to handle incoming saga events/commands.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @param {T} microservice - The microservice for which to connect to the saga command emitter.
 * @returns {Promise<Emitter>} Emitter<ConsumerEvents<T>> - A promise that resolves to an emitter for handling the saga events/commands
 * emitted by the specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T
 *
 * @example
 * // Establish a connection and connect to the 'image' microservice's saga command emitter
 * const url = 'amqp://localhost';
 * const e = await connectToSagaCommandEmitter(url, AvailableMicroservices.Image);
 *
 * // Listen for 'image' microservice saga events/commands
 * e.on(ImageCommands.CreateImage, async ({ channel, sagaId, payload }) => {
 *   // Handle the 'create_image' saga event/command for the 'image' microservice, ack or nack the message
 * });
 *
 * // Listen to all commands/events emitted by the 'image' microservice or use a global pattern, take notice that the events already listen above it needs to be ignored here.
 * e.on('*', async (command, { channel, sagaId, payload }) => {
 *    if (command === ImageCommands.CreateImage) {
 *    // Ignore the event already listened above
 *    return;
 *    }
 *    // ... do something ack or nack if there are commands that are not handled
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 * @see stopRabbitMQ
 * @see startGlobalSagaStepListener
 */
export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(
    url: string,
    microservice: T
): Promise<Emitter<MicroserviceConsumeSagaEvents<T>>> => {
    await prepare(url);
    const q = getQueueConsumer(microservice);
    const e = mitt<MicroserviceConsumeSagaEvents<T>>();
    await createConsumers([q]);
    void consume<MicroserviceConsumeSagaEvents<T>>(e, q.queueName, sagaStepCallback);
    return e;
};

export const connectToEvents = async <T extends AvailableMicroservices, U extends MicroserviceEvent>(
    url: string,
    microservice: T,
    events: U[]
) => {
    await prepare(url);
    const queueName = `${microservice}_match_commands` as const;
    const e = mitt<MicroserviceConsumeEvents<U>>();
    await createHeaderConsumers(queueName, events);
    void consume<MicroserviceConsumeEvents<U>>(e, queueName, eventCallback);
    return e;
};
// todo, hacer que los eventso sean unicos
const consumerEvents = ['ticket.start', 'ticket.generate'] satisfies MicroserviceEvent[];

const exe = async () => {
    const microservice: AvailableMicroservices = 'legend-integrations';
    const e = await connectToEvents('amqp://rabbit:1234@localhost:5672', microservice, consumerEvents);
    // e.on('orders.pay', async ({ channel, payload }) => {
    //     //
    //     console.log('orders.pay', payload);
    //     channel.ackMessage();
    // });
    e.on('ticket.start', async ({ channel, payload }) => {
        //
        // const a = await channel.nackWithDelayAndRetries(1_000, 10);
        // console.log('COUNT', a);
        channel.ackMessage();
        console.log('ticket.start', payload, microservice);
    });
    e.on('ticket.generate', async ({ channel, payload }) => {
        //
        console.log('ticket.generate', payload, microservice);
        channel.ackMessage();
    });
    console.log('hou');
};
// const exeSaga = async () => {
//     const e = await connectToSagaCommandEmitter('amqp://rabbit:1234@localhost:5672', 'legend-integrations');
//     // e.on('orders.pay', async ({ channel, payload }) => {
//     //     //
//     //     console.log('orders.pay', payload);
//     //     channel.ackMessage();
//     // });
//     const i = 0;
//     e.on('emit_nft', async ({ channel, payload, sagaId }) => {
//         channel.ackMessage();
//
//         // const a = await channel.nackWithFibonacciStrategy(8);
//         // console.log(a);
//         // console.log('emit_nft', payload, sagaId, i++);
//     });
//
//     console.log('hou');
// };

exe();

// exeSaga();
// const myEvents: EventsValues[] = ['ticket.generate'];
