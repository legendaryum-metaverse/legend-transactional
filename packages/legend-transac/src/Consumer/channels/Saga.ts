import { nackWithDelay } from '../nack';
import ConsumeChannel from './Consume';
import { AvailableMicroservices } from '../../@types';
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
}
