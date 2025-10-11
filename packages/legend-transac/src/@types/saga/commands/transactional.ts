/**
 * Different commands related to the "transactional" microservice.
 */
export const transactionalCommands = {} as const;
/**
 * Available commands for the "transactional" microservice.
 */
export type TransactionalCommands = (typeof transactionalCommands)[keyof typeof transactionalCommands];
