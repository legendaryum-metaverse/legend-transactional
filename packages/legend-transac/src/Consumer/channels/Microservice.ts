import { queue, status, AvailableMicroservices } from '../../@types';
import { sendToQueue } from '../../Broker';
import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { fibonacci } from '../../utils';
import { MAX_OCCURRENCE } from '../../constants';
/**
 * Represents a **_consume_** channel for a specific microservice.
 * Extends the abstract ConsumeChannel class.
 *
 * @typeparam T - The type of available microservices.
 */
export class MicroserviceConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
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
    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const occurrence = this.updateSagaStepOccurrence(`MicroserviceConsumeChannel-${salt}`, maxOccurrence);
        const delay = fibonacci(occurrence) * 1000; // ms
        const count = await this.nackWithDelayAndRetries(delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    }
}
