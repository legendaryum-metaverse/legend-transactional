/**
 * Different commands related to the "liptv" microservice.
 */
export const liptvCommands = {
    /**
     * Command to report a video.
     */
    ReportVideo: 'report_video'
} as const;
/**
 * Available commands for the "liptv" microservice.
 */
export type LipTVCommands = (typeof liptvCommands)[keyof typeof liptvCommands];
