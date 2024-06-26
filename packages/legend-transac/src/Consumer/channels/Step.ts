import { queue, status, AvailableMicroservices, SagaStep } from '../../@types';
import { sendToQueue } from '../../Broker';
import ConsumeChannel from './Consume';
import { Channel, ConsumeMessage } from 'amqplib';
/**
 * Represents a **_consume_** channel for a specific microservice.
 * Extends the abstract ConsumeChannel class.
 *
 * @typeparam T - The type of available microservices.
 */
export class MicroserviceConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel {
    /**
     * The saga step associated with the consumed message.
     */
    protected readonly step: SagaStep<T>;

    /**
     * Constructs a new instance of the ConsumeChannel class.
     *
     * @param {Channel} channel - The channel to interact with the message broker.
     * @param {ConsumeMessage} msg - The consumed message to be processed.
     * @param {string} queueName - The name of the queue from which the message was consumed.
     * @param {SagaStep} step - The saga step associated with the consumed message.
     */
    public constructor(channel: Channel, msg: ConsumeMessage, queueName: string, step: SagaStep<T>) {
        super(channel, msg, queueName);
        this.step = step;
    }

    ackMessage(payloadForNextStep: Record<string, unknown> = {}): void {
        this.step.status = status.Success;
        const previousPayload = this.step.previousPayload;
        let metaData = {};
        if (previousPayload) {
            metaData = Object.keys(previousPayload)
                .filter(key => key.startsWith('__'))
                .reduce((obj, key) => ((obj[key] = previousPayload[key]), obj), {} as Record<string, unknown>);
        }
        this.step.payload = {
            ...payloadForNextStep,
            ...metaData
        };

        sendToQueue(queue.ReplyToSaga, this.step)
            .then(() => {
                this.channel.ack(this.msg, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
}

/**
 * Represents a **_consume_** channel for handling saga events/commands.
 * Extends the MicroserviceConsumeChannel class.
 *
 */
export class SagaConsumeChannel<T extends AvailableMicroservices> extends MicroserviceConsumeChannel<T> {
    /**
     * Acknowledges the consumed saga event/command.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }
}
