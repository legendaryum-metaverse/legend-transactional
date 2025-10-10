import {
  SagaConsumeSagaEvents,
  exchange,
  queue,
  AvailableMicroservices,
  CommenceSagaEvents,
  MicroserviceEvent,
  MicroserviceConsumeEvents,
  SagaTitle,
} from '../@types';
import { getConsumeChannel } from './consumeChannel';
import {
  commenceSagaConsumeCallback,
  consume,
  createConsumers,
  createHeaderConsumers,
  sagaStepCallback,
  sagaConsumeCallback,
  eventCallback,
  createAuditLoggingResources,
} from '../Consumer';
import { getQueueConsumer } from '../utils';
import mitt, { Emitter } from 'mitt';
import { MicroserviceConsumeSagaEvents } from '../@types/saga/microservice';
import amqplib, { ChannelModel } from 'amqplib';

let conn: ChannelModel | null = null;
let isTheConnectionClosed = true;

const startListeners = (c: ChannelModel) => {
  c.addListener('close', (e: Error) => {
    isTheConnectionClosed = true;
    console.error('[legend_transac:__Connection closed__]', e.message);
  });
  c.addListener('error', (e: Error) => {
    isTheConnectionClosed = true;
    console.error('[legend_transac:__Connection error__]', e.message);
  });
};

let storedConfig: TransactionalConfig<AvailableMicroservices, MicroserviceEvent> | undefined;

export const getStoredConfig = () => {
  if (!storedConfig) {
    throw new Error('RabbitMQ Config not initialized.');
  }
  return storedConfig;
};

/**
 * Get the RabbitMQ connection or establish a new connection if not already connected.
 *
 * @returns {Promise<ChannelModel>} A promise that resolves to the RabbitMQ connection.
 */
export const getRabbitMQConn = async (): Promise<ChannelModel> => {
  if (conn === null) {
    conn = await amqplib.connect(getStoredConfig().url);
    isTheConnectionClosed = false;
    startListeners(conn);
  }
  return conn;
};
/**
 * Close the RabbitMQ connection if it is open.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successfully closed.
 */
export const closeRabbitMQConn = async (): Promise<void> => {
  if (conn !== null) {
    await conn.close();
    conn = null;
    storedConfig = undefined;
  }
};

/**
 * Save the queue name for health check purposes.
 */
let healthCheckQueue: string | null = null;

/**
 * Save the queue name for health check purposes.
 * @param queue
 */
export const saveQueueForHealthCheck = (queue: string) => {
  healthCheckQueue = queue;
};

/**
 * Checks the health of a RabbitMQ connection by creating a test channel and checking an already created queue.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the connection is healthy and the queue exists, or `false` otherwise.
 */
export const isConnectionHealthy = async (): Promise<boolean> => {
  let isHealthy = false;
  if (isTheConnectionClosed) return isHealthy;
  if (conn === null) return isHealthy;
  if (healthCheckQueue === null) return isHealthy;
  const queue = healthCheckQueue;
  // si el check falla, se cierra la conexión:
  // https://github.com/amqp-node/amqplib/issues/649
  const closeListener = (e: Error) => {
    isTheConnectionClosed = true;
    console.error('[legend_transac:health_check_listener:__Connection closed__]', e.message);
  };

  const errorListener = (e: Error) => {
    isTheConnectionClosed = true;
    console.error('[legend_transac:health_check_listener:__Connection error__]', e.message);
  };

  conn.addListener('close', closeListener);
  conn.addListener('error', errorListener);
  const testChannel = await conn.createConfirmChannel();

  try {
    const testChannelPromise = new Promise<void>((resolve, reject) => {
      testChannel
        .checkQueue(queue)
        .then(() => {
          // console.log('[Check success]', info);
          isHealthy = true;
          resolve();
        })
        .catch((e) => {
          console.error('[legend_transac:health_check_listener:Check failed]', (e as Error).message);
          reject(e);
        });
    });
    await testChannelPromise;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // si falla no es necesario cerrar el canal porque ya se cerró
    return isHealthy;
  }
  await testChannel.close();
  conn.removeListener('close', closeListener);
  conn.removeListener('error', errorListener);
  // success
  return isHealthy;
};

/**
 * Prepare the library for consuming messages by saving the RabbitMQ URI, establishing a connection,
 * and getting the **_consume_** channel.
 *
 * @throws {Error} If there is an issue with saving the URI, establishing a connection, or getting the consume channel.
 * @see saveUri
 * @see getRabbitMQConn
 * @see getConsumeChannel
 * @param config - Configuration for receiving saga commands to a specific microservice and handle incoming subscription events.
 */
const prepare = async <T extends AvailableMicroservices>(config: TransactionalConfig<T, MicroserviceEvent>) => {
  if (storedConfig) return storedConfig;
  await getRabbitMQConn();
  await getConsumeChannel();
  storedConfig = config;
  return storedConfig;
};
/**
 * Start a global saga listener to handle incoming saga events/commands from all microservices.
 *
 * @param {string} url - The RabbitMQ URL to establish a connection.
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
const startGlobalSagaStepListener = async <T extends AvailableMicroservices>(
  url: string,
): Promise<Emitter<SagaConsumeSagaEvents<T>>> => {
  await prepare({
    url,
    microservice: 'transactional',
    events: [],
  });
  const queueO = {
    queueName: queue.ReplyToSaga,
    exchange: exchange.ReplyToSaga,
  };
  const e = mitt<SagaConsumeSagaEvents<T>>();
  await createConsumers([queueO]);
  void consume<SagaConsumeSagaEvents<T>>(e, queueO.queueName, sagaConsumeCallback);
  return e;
};
/**
 * Start a saga listener to handle incoming **commence saga events**
 *
 * @param {string} url - The RabbitMQ URL to establish a connection.
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
const commenceSagaListener = async <U extends SagaTitle>(url: string): Promise<Emitter<CommenceSagaEvents<U>>> => {
  await prepare({
    url,
    microservice: 'transactional',
    events: [],
  });
  const q = {
    queueName: queue.CommenceSaga,
    exchange: exchange.CommenceSaga,
  };
  const e = mitt<CommenceSagaEvents<U>>();
  await createConsumers([q]);
  void consume<CommenceSagaEvents<U>>(e, q.queueName, commenceSagaConsumeCallback);
  return e;
};

let transactionalInitialized = false;
/**
 * A class to connect to the saga orchestration system and handle incoming saga events/commands.
 * @template T - `AvailableMicroservices` enum.
 * @template U - `SagaTitle` enum.
 * @class
 * @example
 *   const t = new Transactional('amqp://localhost');
 *   const e = await t.startGlobalSagaStepListener();
 *   e.on('*', (command, { step, channel }) => {
 *   // Process all incoming saga commands
 *   });
 *
 *   const c = await saga.commenceSagaListener();
 *   c.on("update_user:image", async ({ channel, saga }) => {
 *   // Start the 'update_user:image' saga
 *   });
 *
 *   // When not needed anymore, you can close the RabbitMQ connection
 *   await stopRabbitMQ();
 *   @see stopRabbitMQ
 *   @see commenceSagaListener
 *   @see startGlobalSagaStepListener
 */
export class Transactional<T extends AvailableMicroservices, U extends SagaTitle> {
  constructor(private url: string) {
    if (transactionalInitialized) {
      throw new Error('Transactional already initialized');
    }
    transactionalInitialized = true;
  }

  startGlobalSagaStepListener = () => {
    return startGlobalSagaStepListener<T>(this.url);
  };
  commenceSagaListener = () => {
    return commenceSagaListener<U>(this.url);
  };
}

/**
 * Configuration for receiving saga commands to a specific microservice and handle incoming subscription events.
 * @template T - The specific microservice to connect to (e.g., 'image', 'payment'). Must be one of the types defined in the `AvailableMicroservices` enum.
 * @template U - The type of event to listen for. Must be one of the types defined in the `MicroserviceEvent` enum.
 * @property {string} url - The RabbitMQ URL to establish a connection.
 * @property {T} microservice - The microservice for which to connect to the saga command emitter.
 * @property {U[]} events - An array of event types (`MicroserviceEvent`) to subscribe to.
 * @interface
 * @example
 * const config: TransactionalConfig<AvailableMicroservices.Image, MicroserviceEvent.ImageCreated> = {
 *    url: 'amqp://localhost',
 *    microservice: AvailableMicroservices.Image,
 *    events: [MicroserviceEvent.ImageCreated]
 *    };
 *    const emitter = await connectToEvents(config);
 *    emitter.on(MicroserviceEvent.ImageCreated, ({ channel, payload }) => {
 *    // Process the image creation payload
 *    });
 *    // When not needed anymore, you can close the RabbitMQ connection
 *    await stopRabbitMQ();
 */
export interface TransactionalConfig<T extends AvailableMicroservices, U extends MicroserviceEvent> {
  url: string;
  microservice: T;
  events: U[];
}

/**
 * Connects to a specific microservice's saga command emitter to handle incoming saga events/commands.
 *
 * @param [config] - Configuration for receiving saga commands to a specific microservice and handle incoming saga commands.
 * @returns {Promise<Emitter>} Emitter<MicroserviceConsumeSagaEvents<T>> - A promise that resolves to an emitter for handling the saga commands
 * emitted to a specified microservice.
 * @throws {Error} If the RabbitMQ URI is not initialized or there is an issue with the connection.
 *
 * @template T - The specific microservice to connect to (e.g., 'image', 'payment'). Must be one of the types defined in the `AvailableMicroservices` enum.
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
const connectToSagaCommandEmitter = async <T extends AvailableMicroservices>(
  config: TransactionalConfig<T, MicroserviceEvent>,
): Promise<Emitter<MicroserviceConsumeSagaEvents<T>>> => {
  const storedConfig = await prepare(config);
  const q = getQueueConsumer(storedConfig.microservice);
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
 * @param {TransactionalConfig<T, U>} config - Configuration for receiving saga commands to a specific microservice and handle incoming subscription events.
 * @returns {Promise<Emitter>} Emitter<MicroserviceConsumeEvents<U>> - A promise that resolves to an emitter, providing a way to listen to the specified events.
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
const connectToEvents = async <T extends AvailableMicroservices, U extends MicroserviceEvent>(
  config: TransactionalConfig<T, U>,
): Promise<Emitter<MicroserviceConsumeEvents<U>>> => {
  const storedConfig = await prepare(config);
  const queueName = `${storedConfig.microservice}_match_commands` as const;
  const e = mitt<MicroserviceConsumeEvents<U>>();
  await createHeaderConsumers(queueName, storedConfig.events);

  // Create audit logging resources automatically when connecting to events
  // This feature is related only to "events", that is why we create it here
  await createAuditLoggingResources();

  void consume<MicroserviceConsumeEvents<U>>(e, queueName, eventCallback);
  return e;
};

let sagaInitialized = false;

/**
 * A class to connect to a specific microservice's saga command emitter and handle incoming saga events/commands.
 * @template T - The specific microservice to connect to (e.g., 'image', 'payment'). Must be one of the types defined in the `AvailableMicroservices` enum.
 * @template U - The type of event to listen for. Must be one of the types defined in the `MicroserviceEvent` enum.
 * @class
 * @example
 * const saga = new Saga({
 *   url: 'amqp://localhost',
 *   microservice: AvailableMicroservices.Image,
 *   events: [MicroserviceEvent.ImageCreated, MicroserviceEvent.ImageDeleted]
 *   });
 *   const emitter = await saga.connectToEvents();
 *   emitter.on(MicroserviceEvent.ImageCreated, ({ channel, payload }) => {
 *   // Process the image creation payload
 *   });
 *   emitter.on(MicroserviceEvent.ImageDeleted, ({ channel, payload }) => {
 *   // Process the image deletion payload
 *   });
 *
 *   const commandEmitter = await saga.connectToSagaCommandEmitter();
 *   commandEmitter.on(ImageCommands.CreateImage, async ({ channel, sagaId, payload }) => {
 *   // Handle the 'create_image' saga event/command for the 'image' microservice, ack or nack the message
 *   });
 *
 *   // When not needed anymore, you can close the RabbitMQ connection
 *   await stopRabbitMQ();
 *   @see stopRabbitMQ
 *   @see connectToEvents
 *   @see connectToSagaCommandEmitter
 */
export class Saga<T extends AvailableMicroservices, U extends MicroserviceEvent> {
  constructor(private conf: TransactionalConfig<T, U>) {
    if (sagaInitialized) {
      throw new Error('Saga already initialized');
    }
    // Para que este micro pueda realizar pasos del saga y realizar commence_saga ops las queue's deben existir, no es responsabilidad
    // de los micros crear estos recursos, el micro "transactional" debe crear estos recursos -> "queue.CommenceSaga" en commenceSagaListener
    // y "queue.ReplyToSaga" en startGlobalSagaStepListener
    sagaInitialized = true;
  }

  connectToEvents = () => {
    return connectToEvents<T, U>(this.conf);
  };
  connectToSagaCommandEmitter = () => {
    return connectToSagaCommandEmitter<T>(this.conf);
  };
}

