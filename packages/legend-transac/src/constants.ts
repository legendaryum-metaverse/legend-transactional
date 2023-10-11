import { SagaStepDefaults, status } from './@types';
/**
 * Define the nacking delay in milliseconds
 * @default
 * @constant
 */
export const NACKING_DELAY_MS = 2000;
/**
 * Define the maximum occurrence in a fail saga step of the nack delay with fibonacci strategy
 * | Occurrence | Delay in the next nack       |
 * |------------|-------------|
 * | 17         | 0.44 hours  |
 * | 18         | 0.72 hours  |
 * | 19         | 1.18 hours  |
 * | 20         | 1.88 hours  |
 * | 21         | 3.04 hours  |
 * | 22         | 4.92 hours  |
 * | 23         | 7.96 hours  |
 * | 24         | 12.87 hours |
 * | 25         | 20.84 hours |
 * @default
 * @constant
 *
 * @see ConsumeChannel
 */
export const MAX_OCCURRENCE = 19;
/**
 * Define the maximum number of nack retries
 * @default
 * @constant
 */
export const MAX_NACK_RETRIES = 20;
/**
 * Define default values for saga step data using imported types
 *
 * @type {SagaStepDefaults}
 * @property {object} payload - Default payload is an empty object
 * @property {object} previousPayload - Default previous payload is an empty object
 * @property {status} status - Default status is 'Pending' from the imported Status enum
 * @property {boolean} isCurrentStep - Default isCurrentStep is set to 'false'
 * @default
 * @constant
 */
export const nodeDataDefaults: SagaStepDefaults = {
    payload: {},
    previousPayload: {},
    status: status.Pending,
    isCurrentStep: false
} as const;
