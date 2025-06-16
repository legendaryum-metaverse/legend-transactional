import ConsumeChannel from './Consume';

/**
 * Class representing a consumer channel for processing sagas in a microservice environment.
 *
 */
export class SagaCommenceConsumeChannel extends ConsumeChannel {
  /**
   * Method to acknowledge the message.
   */
  ackMessage(): void {
    this.channel.ack(this.msg, false);
  }
}
