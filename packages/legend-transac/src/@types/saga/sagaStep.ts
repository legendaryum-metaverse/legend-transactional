import { AvailableMicroservices } from '../microservices';
import { CommandMap, MicroserviceCommand } from './commands';

/**
 * Represents the different statuses that a saga step can have.
 */
export const status = {
  /**
   * The step is pending and hasn't been processed yet.
   */
  Pending: 'pending',
  /**
   * The step has been successfully executed.
   */
  Success: 'success',
  /**
   * The step execution has failed.
   */
  Failure: 'failure',
  /**
   * The step has been sent but not yet executed.
   */
  Sent: 'sent',
} as const;
/**
 * Type of available statuses for a saga step.
 */
export type Status = (typeof status)[keyof typeof status];

/**
 * Represents the default properties of a saga step.
 */
export interface SagaStepDefaults {
  /**
   * The status of the saga step.
   */
  status: Status;
  /**
   * The payload associated with the saga step.
   */
  payload: Record<string, unknown>;
  /**
   * The previous payload of the saga step.
   */
  previousPayload: Record<string, unknown>;
  /**
   * Indicates if the step is the current active step.
   */
  isCurrentStep: boolean;
}

/**
 * Represents a saga step for a specific microservice.
 */
export interface SagaStep<T extends AvailableMicroservices> extends SagaStepDefaults, MicroserviceCommand<T> {
  /**
   * The microservice associated with the step.
   */
  microservice: T;
  /**
   * The command type based on the microservice, ensuring correctness.
   */
  command: CommandMap[T];
  /**
   * The status of the saga step.
   */
  status: Status;
  /**
   * The ID of the saga.
   */
  sagaId: number;
  /**
   * The payload associated with the saga step.
   */
  payload: Record<string, unknown>;
  /**
   * The previous payload of the saga step.
   */
  previousPayload: Record<string, unknown>;
  /**
   * Indicates if the step is the current active step.
   */
  isCurrentStep: boolean;
}
