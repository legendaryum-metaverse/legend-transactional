import {
    ConsumerEvents,
    ConsumerSagaEvents,
    exchange,
    queue,
    AvailableMicroservices,
    ConsumerCommenceSaga
} from '../@types';
import { getRabbitMQConn, saveUri } from './rabbitConn';
import { getConsumeChannel } from './consumeChannel';
import {
    commenceSagaConsumeCallback,
    consume,
    createConsumers,
    microserviceConsumeCallback,
    sagaConsumeCallback
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
    Emitter<ConsumerSagaEvents<T>>
> => {
    const queueO = {
        queueName: queue.ReplyToSaga,
        exchange: exchange.ReplyToSaga
    };
    const e = mitt<ConsumerSagaEvents<T>>();
    await createConsumers([queueO]);
    void consume<ConsumerSagaEvents<T>>(e, queueO.queueName, sagaConsumeCallback);
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
export const commenceSagaListener = async <T extends Record<string, any>>(): Promise<
    Emitter<ConsumerCommenceSaga<T>>
> => {
    const q = {
        queueName: queue.CommenceSaga,
        exchange: exchange.CommenceSaga
    };
    const e = mitt<ConsumerCommenceSaga<T>>();
    await createConsumers([q]);
    void consume<ConsumerCommenceSaga<T>>(e, q.queueName, commenceSagaConsumeCallback);
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
export const startSaga = async (
    url: string
): Promise<{
    globalSagaStepListener: Emitter<ConsumerSagaEvents<AvailableMicroservices>>;
    commenceSagaListener: Emitter<ConsumerCommenceSaga<Record<string, any>>>;
}> => {
    await prepare(url);
    const g = await startGlobalSagaStepListener();
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
): Promise<Emitter<ConsumerEvents<T>>> => {
    await prepare(url);
    const q = getQueueConsumer(microservice);
    const e = mitt<ConsumerEvents<T>>();
    await createConsumers([q]);
    void consume<ConsumerEvents<T>>(e, q.queueName, microserviceConsumeCallback);
    return e;
};
