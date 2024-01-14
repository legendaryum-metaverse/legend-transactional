/**
 * Different commands related to the "notificaciones" microservice.
 */
export const notificationCommands = {
    /**
     * Command to send a recovery password email.
     */
    SendEmailToken: 'send_email:token',
    /**
     * Command to persist send email token action.
     */
    SendEmailTokenPersist: 'send_email:token:persist',
    /**
     * Command to send mail to the user.
     */
    SendMailThanks: 'send:mail:thanks'
} as const;
/**
 * Available commands for the "notificaciones" microservice.
 */
export type NotificationCommands = (typeof notificationCommands)[keyof typeof notificationCommands];
