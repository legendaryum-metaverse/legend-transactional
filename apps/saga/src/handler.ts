import { AvailableMicroservices, CommandMap, SagaHandler } from 'legend-transactional';

export const handler = (
  command: CommandMap[AvailableMicroservices],
  { channel, step }: SagaHandler<AvailableMicroservices>,
) => {
  try {
    console.info(`Received ${command} event:`, step);
    // await SagaManager.continue(step);
  } catch (e) {
    console.error(e);
    channel.nackWithDelay(2000, 20);
    return;
  }
  channel.ackMessage();
};
