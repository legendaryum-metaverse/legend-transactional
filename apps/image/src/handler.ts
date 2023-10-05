import { CommandHandler, CommandMap } from 'legend-transac';

const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.6;
};
export const handler = async (
    command: CommandMap['test-image'],
    { channel, sagaId, payload }: CommandHandler<'test-image'>
) => {
    if (needToRequeueWithDelay()) {
        const count = await channel.nackWithDelayAndRetries(1000, 30);
        console.log(`NACK - Requeue ${command} with delay and retries:`, count);
    } else {
        console.log(`${command}`, { payload, sagaId });
        await waitWithMessage('Comando de imagen procesado', 100);
        channel.ackMessage({ imagedIdForNextStep: Math.random() });
    }
};
