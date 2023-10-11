import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { AvailableMicroservices } from '../../@types';
import { fibonacci } from '../../utils';
import { MAX_OCCURRENCE } from '../../constants';

/**
 * Represents a **_consume_** channel for handling saga events/commands.
 * Extends the abstract ConsumeChannel class.
 *
 * @typeparam T - The type of available microservices.
 */
export class SagaConsumeChannel<T extends AvailableMicroservices> extends ConsumeChannel<T> {
    /**
     * Acknowledges the consumed saga event/command.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }
    nackMessage(): void {
        this.channel.nack(this.msg, false, false);
    }

    async nackWithDelayAndRetries(delay?: number, maxRetries?: number) {
        return await nackWithDelay(this.msg, this.queueName, delay, maxRetries);
    }

    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const occurrence = this.updateSagaStepOccurrence(`SagaConsumeChannel-${salt}`, maxOccurrence);
        const delay = fibonacci(occurrence) * 1000; // ms
        const count = await this.nackWithDelayAndRetries(delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    }
}
