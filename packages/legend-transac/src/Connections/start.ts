import {
    MicroserviceConsumeSagaEvents,
    SagaConsumeSagaEvents,
    exchange,
    queue,
    AvailableMicroservices,
    CommenceSagaEvents,
    MicroserviceEvent,
    MicroserviceConsumeEvents,
    SagaTitle
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
 * await prepare('amqp://localhost');
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
 * await prepare('amqp://localhost');
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
export const commenceSagaListener = async <U extends SagaTitle>(): Promise<Emitter<CommenceSagaEvents<U>>> => {
    const q = {
        queueName: queue.CommenceSaga,
        exchange: exchange.CommenceSaga
    };
    const e = mitt<CommenceSagaEvents<U>>();
    await createConsumers([q]);
    void consume<CommenceSagaEvents<U>>(e, q.queueName, commenceSagaConsumeCallback);
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
export const startSaga = async <T extends AvailableMicroservices, U extends SagaTitle>(
    url: string
): Promise<{
    globalSagaStepListener: Emitter<SagaConsumeSagaEvents<T>>;
    commenceSagaListener: Emitter<CommenceSagaEvents<U>>;
}> => {
    await prepare(url);
    const g = await startGlobalSagaStepListener<T>();
    const c = await commenceSagaListener<U>();
    return {
        globalSagaStepListener: g,
        commenceSagaListener: c
    };
};

/**
 * Connects to a specific microservice's saga command emitter to handle incoming saga events/commands.
 *
 * @param {T} microservice - The microservice for which to connect to the saga command emitter.
 * @returns {Promise<Emitter>} Emitter<ConsumerEvents<T>> - A promise that resolves to an emitter for handling the saga events/commands
 * emitted by the specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T
 *
 * @example
 * // Establish a connection and connect to the 'image' microservice's saga command emitter
 * await prepare('amqp://localhost');
 * const e = await connectToSagaCommandEmitter(AvailableMicroservices.Image);
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
 * @see startTransactional
 */
export const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(
    microservice: T
): Promise<Emitter<MicroserviceConsumeSagaEvents<T>>> => {
    const q = getQueueConsumer(microservice);
    const e = mitt<MicroserviceConsumeSagaEvents<T>>();
    await createConsumers([q]);
    void consume<MicroserviceConsumeSagaEvents<T>>(e, q.queueName, sagaStepCallback);
    return e;
};
/**
 * Connects to specific events emitted by a particular microservice.
 *
 * This allows you to listen for and handle specific events of interest, filtering out other events the microservice might emit.
 *
 * @template T - The specific microservice to connect to (e.g., 'image', 'payment'). Must be one of the types defined in the `AvailableMicroservices` enum.
 * @template U - The type of event to listen for. Must be one of the types defined in the `MicroserviceEvent` enum.
 *
 * @param {T} microservice - The microservice from which to receive events.
 * @param {U[]} events - An array of event types (`MicroserviceEvent`) to subscribe to.
 * @returns {Promise<Emitter<MicroserviceConsumeEvents<U>>>} - A promise that resolves to an emitter, providing a way to listen to the specified events.
 * @async
 *
 * @example
 * const url = 'amqp://localhost';
 * await prepare(url);
 * // Connect to the 'image' microservice and listen for 'ImageCreated' and 'ImageDeleted' events
 * const emitter = await connectToEvents(AvailableMicroservices.Image, [MicroserviceEvent.ImageCreated, MicroserviceEvent.ImageDeleted]);
 *
 * // Handle 'ImageCreated' events
 * emitter.on(MicroserviceEvent.ImageCreated, ({ channel, payload }) => {
 *   // Process the image creation payload
 * });
 *
 * // Handle 'ImageDeleted' events
 * emitter.on(MicroserviceEvent.ImageDeleted, ({ channel, payload }) => {
 *   // Process the image deletion payload
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 *
 * @see stopRabbitMQ
 * @see prepare
 * @see connectToSagaCommandEmitter
 * @see startTransactional
 * @see AvailableMicroservices
 * @see MicroserviceEvent
 */
export const connectToEvents = async <T extends AvailableMicroservices, U extends MicroserviceEvent>(
    microservice: T,
    events: U[]
): Promise<Emitter<MicroserviceConsumeEvents<U>>> => {
    const queueName = `${microservice}_match_commands` as const;
    const e = mitt<MicroserviceConsumeEvents<U>>();
    await createHeaderConsumers(queueName, events);
    void consume<MicroserviceConsumeEvents<U>>(e, queueName, eventCallback);
    return e;
};

/**
 * Starts a transactional message handler for a microservice, enabling both event listening and saga command processing.
 *
 * This function is designed to simplify the setup of microservices that need to both:
 *   1. Listen for and react to specific events.
 *   2. Participate in sagas by processing commands from other microservices.
 *
 * By using a single function, you streamline the connection to RabbitMQ, queue setup, and event/command subscriptions.
 *
 * @template T - The specific microservice to connect to (e.g., 'image', 'payment'). Must be one of the types defined in the `AvailableMicroservices`.
 * @template U - The types of events to listen for. Must be an array of types defined in the `MicroserviceEvent`.
 *
 * @param {string} url - The URL of the RabbitMQ server to establish a connection.
 * @param {T} microservice - The microservice from which to receive events and commands.
 * @param {U[]} events - An array of event types (`MicroserviceEvent`) to subscribe to.
 *
 * @returns {Promise<{ eventEmitter: Emitter<MicroserviceConsumeEvents<U>>, commandEmitter: Emitter<MicroserviceConsumeSagaEvents<T>> }>} - A promise that resolves to an object containing two emitters:
 *   - `eventEmitter`:  For handling the specified events from the microservice.
 *   - `commandEmitter`: For handling saga commands directed at the microservice.
 * @async
 *
 * @example
 * const url = 'amqp://localhost';
 *
 * // Connect to the 'payment' microservice, listen for 'PaymentSuccess' and 'PaymentFailure' events, and handle saga commands
 * const { eventEmitter, commandEmitter } = await startTransactional(url, AvailableMicroservices.Payment, [
 *   MicroserviceEvent.PaymentSuccess,
 *   MicroserviceEvent.PaymentFailure
 * ]);
 *
 * // Handle 'PaymentSuccess' events
 * eventEmitter.on(MicroserviceEvent.PaymentSuccess, ({ channel, payload }) => {
 *   // Process the successful payment
 * });
 *
 * // Handle saga commands for the 'payment' microservice (e.g., 'ProcessPayment')
 * commandEmitter.on(PaymentCommands.ProcessPayment, ({ channel, sagaId, payload }) => {
 *   // Process the payment command as part of a saga
 * });
 *
 * // When not needed anymore, you can close the RabbitMQ connection
 * await stopRabbitMQ();
 *
 * @see stopRabbitMQ
 * @see connectToEvents
 * @see connectToSagaCommandEmitter
 */
export const startTransactional = async <T extends AvailableMicroservices, U extends MicroserviceEvent>(
    url: string,
    microservice: T,
    events: U[]
): Promise<{
    eventEmitter: Emitter<MicroserviceConsumeEvents<U>>;
    commandEmitter: Emitter<MicroserviceConsumeSagaEvents<T>>;
}> => {
    await prepare(url);
    const eventEmitter = await connectToEvents(microservice, events);
    const commandEmitter = await connectToSagaCommandEmitter(microservice);

    return {
        eventEmitter,
        commandEmitter
    };
};
