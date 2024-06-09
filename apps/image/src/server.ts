import express, { Request, Response } from 'express';
import { connectToSagaCommandEmitter, stopRabbitMQ } from 'legend-transactional';
import { handler } from './handler';

const app = express();
const PORT = process.env.PORT ?? '3020';

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send("Hello, I'm micro-image");
});
app.get('/ping', (_req: Request, res: Response) => {
    res.send('pong');
});

app.listen(PORT, async () => {
    const e = await connectToSagaCommandEmitter({
        url: process.env.RABBIT_URI ?? 'amqp://rabbit:1234@localhost:5672',
        microservice: 'test-image',
        events: []
    });
    e.on('*', handler);
    console.info(`${String.fromCodePoint(0x1f680)} Server is running on port ${PORT}`);
});

const terminateProcessListener: NodeJS.SignalsListener = async signal => {
    await stopRabbitMQ();
    console.warn('\x1b[31m%s\x1b[0m', `${String.fromCodePoint(0x1f44b)} ${signal} Server is shutting down. Goodbye!`);
    process.exit(0);
};

process.on('SIGINT', terminateProcessListener);
process.on('SIGTERM', terminateProcessListener);
