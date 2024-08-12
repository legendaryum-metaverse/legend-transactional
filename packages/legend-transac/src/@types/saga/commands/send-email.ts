/**
 * Different commands related to the "send-email" microservice.
 */
export const sendEmailCommands = {} as const;
/**
 * Available commands for the "send-email" microservice.
 */
export type SendEmailCommands = (typeof sendEmailCommands)[keyof typeof sendEmailCommands];
