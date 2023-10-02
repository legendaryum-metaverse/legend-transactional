import { queue, status, AvailableMicroservices } from '../../@types';
import { sendToQueue } from '../../Broker';
import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { fibonacci } from '../../utils';
/**
 * Represents a **_consume_** channel for a specific microservice.
 * Extends the abstract ConsumeChannel class.
 *
 * @typeparam T - The type of available microservices.
 */
export class MicroserviceConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
    ackMessage(payloadForNextStep: Record<string, any>): void {
        this.step.status = status.Success;
        this.step.payload = payloadForNextStep;

        sendToQueue(queue.ReplyToSaga, this.step)
            .then(() => {
                this.channel.ack(this.msg, false);
            })
            .catch(err => {
                console.error(err);
            });
    }
    nackMessage(): void {
        this.step.status = status.Failure;

        sendToQueue(queue.ReplyToSaga, this.step)
            .then(() => {
                this.channel.nack(this.msg, false, false);
            })
            .catch(err => {
                console.error(err);
            });
    }

    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        return await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }
    async nackWithFibonacciStrategy(salt = '') {
        const occurrence = this.updateSagaStepOccurrence(`MicroserviceConsumeChannel-${salt}`);
        const delay = fibonacci(occurrence) * 1000; // ms
        const count = await this.nackWithDelayAndRetries(delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    }
}
