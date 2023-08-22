/**
 * Different commands related to the "notificaciones" microservice.
 */
export const notificacionesCommands = {
    /**
     * Command to report a video.
     */
    SendEmailReportVideo: 'send_email:report_video'
} as const;
/**
 * Available commands for the "notificaciones" microservice.
 */
export type NotificacionesCommands = (typeof notificacionesCommands)[keyof typeof notificacionesCommands];
