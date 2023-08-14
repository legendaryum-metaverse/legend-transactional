import express, { Request, Response } from 'express';
import {
    mintCommands,
    stopRabbitMQ,
    startGlobalSagaListener,
    connectToSagaCommandEmitter,
    availableMicroservices, AvailableMicroservices
} from 'legend-transac';

const app = express();
const port = process.env.PORT ?? '3022';

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm saga");
});
app.get('/ping', (_req: Request, res: Response) => {
    res.send('pong');
});

const needToRequeueWithDelay = () => {
    return Math.random() >= 0.6;
};
const waitWithMessage = async (msg: string, time: number) => {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(msg);
};
app.listen(port, async () => {
    const RABBIT_URI = process.env.RABBIT_URI ?? 'amqp://rabbit:1234@localhost:5672';
    const e = await startGlobalSagaListener(RABBIT_URI);

    e.on(mintCommands.MintImage, async ({ channel, step }) => {
        if (needToRequeueWithDelay()) {
            console.log(`NACK - Requeue ${mintCommands.MintImage} with delay`);
            await channel.nackWithDelayAndRetries(1000, 30);
        } else {
            console.log(`${mintCommands.MintImage}`, { payload, sagaId });
            await waitWithMessage('La imagen se ha minteado', 100);
            channel.ackMessage({ tokenId: Math.random() });
        }
    });
    console.log(`Server is running on http://localhost:${port}`);
});

const terminateProcessListener: NodeJS.SignalsListener = async signal => {
    await stopRabbitMQ();
    console.warn('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
