import { MicroserviceHandler } from 'legend-transactional';

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.6;
};
const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};
export const handler = async ({ channel, sagaId, payload }: MicroserviceHandler<'test-mint'>) => {
    if (needToRequeueWithDelay()) {
        console.log(`NACK - Requeue 'mint_image' with delay`);
        channel.nackWithDelay(1000, 30);
    } else {
        console.log('mint_image', { payload, sagaId });
        await waitWithMessage('La imagen se ha minteado', 100);
        channel.ackMessage({ tokenId: Math.random() });
    }
};
