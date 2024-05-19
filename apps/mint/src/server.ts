import express, { Request, Response } from 'express';
import { connectToSagaCommandEmitter, prepare, stopRabbitMQ } from 'legend-transactional';
import { handler } from './handler';

const app = express();
const PORT = process.env.PORT ?? '3022';

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm micro-mint");
});
app.get('/ping', (_req: Request, res: Response) => {
    res.send('pong');
});

app.listen(PORT, async () => {
    await prepare(process.env.RABBIT_URI ?? 'amqp://rabbit:1234@localhost:5672');
    const e = await connectToSagaCommandEmitter('test-mint');
    e.on('mint_image', handler);
    console.info(`${String.fromCodePoint(0x1f680)} Server is running on port ${PORT}`);
});

const terminateProcessListener: NodeJS.SignalsListener = async signal => {
    await stopRabbitMQ();
    console.warn('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
