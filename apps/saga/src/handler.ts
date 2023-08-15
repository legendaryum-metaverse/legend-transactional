import { AvailableMicroservices, CommandMap, SagaHandler } from 'legend-transac';

export const handler = async (
    command: CommandMap[AvailableMicroservices],
    { channel, step }: SagaHandler<AvailableMicroservices>
) => {
    try {
        console.info(`Received ${command} event:`, step);
        // await SagaManager.continue(step);
    } catch (e) {
        console.error(e);
        await channel.nackWithDelayAndRetries(2000, 20);
        return;
    }
    channel.ackMessage();
};
