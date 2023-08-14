import { AvailableMicroservices, ImageCommands, MintCommands, SagaHandler } from 'legend-transac';

export const handler = async (
    command: MintCommands | ImageCommands,
    { channel, step }: SagaHandler<AvailableMicroservices.Mint>
) => {
    if (needToRequeueWithDelay()) {
        console.log(`NACK - Requeue ${MintCommands.MintImage} with delay`);
        await channel.nackWithDelayAndRetries(1000, 30);
    } else {
        console.log(`${MintCommands.MintImage}`, { payload, sagaId });
        await waitWithMessage('La imagen se ha minteado', 100);
        channel.ackMessage({ tokenId: Math.random() });
    }
};
