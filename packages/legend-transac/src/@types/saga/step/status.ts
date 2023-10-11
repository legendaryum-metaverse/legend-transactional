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
    Sent: 'sent'
} as const;
/**
 * Type of available statuses for a saga step.
 */
export type Status = (typeof status)[keyof typeof status];
