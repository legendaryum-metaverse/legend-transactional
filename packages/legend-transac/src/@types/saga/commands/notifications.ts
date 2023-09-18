/**
 * Different commands related to the "notificaciones" microservice.
 */
export const notificationCommands = {
    /**
     * Command to report a video.
     */
    SendEmailReportVideo: 'send_email:report_video'
} as const;
/**
 * Available commands for the "notificaciones" microservice.
 */
export type NotificationCommands = (typeof notificationCommands)[keyof typeof notificationCommands];
