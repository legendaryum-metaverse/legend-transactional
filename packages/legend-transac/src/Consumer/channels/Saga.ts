import { MAX_OCCURRENCE } from '../../constants';
import { AvailableMicroservices } from '../../@types';
import { MicroserviceConsumeChannel } from './Microservice';

/**
 * Represents a **_consume_** channel for handling saga events/commands.
 * Extends the abstract ConsumeChannel class.
 *
 */
export class SagaConsumeChannel<T extends AvailableMicroservices> extends MicroserviceConsumeChannel<T> {
    /**
     * Acknowledges the consumed saga event/command.
     */
    ackMessage(): void {
        this.channel.ack(this.msg, false);
    }

    async nackWithFibonacciStrategy(maxOccurrence = MAX_OCCURRENCE, salt = '') {
        const hashId = this.getStepHashId(`SagaConsumeChannel-${salt}`);
        return this.nackWithFibonacciStrategyHelper(maxOccurrence, hashId);
    }
}
