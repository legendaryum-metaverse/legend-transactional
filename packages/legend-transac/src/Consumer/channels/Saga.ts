import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { AvailableMicroservices } from '../../@types';
import { fibonacci } from '../../utils';

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

    async nackWithFibonacciStrategy(sagaId: number) {
        const occurrence = this.updateSagaOccurrence(sagaId);
        const fibonacciNumber = fibonacci(occurrence);
        const delay = fibonacciNumber * 1000; // ms
        const count = await nackWithDelay(this.msg, this.queueName, delay, Infinity);
        return {
            count,
            delay,
            occurrence
        };
    }
}
