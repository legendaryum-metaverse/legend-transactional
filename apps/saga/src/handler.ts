import { availableMicroservices, imageCommands, mintCommands, SagaHandler } from 'legend-transac';

export const handler = async (
    command: mintCommands | imageCommands,
    { channel, step }: SagaHandler<availableMicroservices>
) => {
    if (needToRequeueWithDelay()) {
        console.log(`NACK - Requeue ${mintCommands.MintImage} with delay`);
        await channel.nackWithDelayAndRetries(1000, 30);
    } else {
        console.log(`${mintCommands.MintImage}`, { payload, sagaId });
        await waitWithMessage('La imagen se ha minteado', 100);
        channel.ackMessage({ tokenId: Math.random() });
    }
};
