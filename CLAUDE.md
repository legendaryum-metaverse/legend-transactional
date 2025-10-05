# legend-transactional - TypeScript Implementation Guide

**Version:** 2.2.3 (Production) | **Status:** ✅ Published to npm | **Language:** TypeScript

RabbitMQ-based microservice orchestration library with Saga patterns and automatic audit logging for the Legendaryum metaverse platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Audit Logging](#audit-logging)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Event System](#event-system)
7. [Saga Orchestration](#saga-orchestration)
8. [Development](#development)
9. [Operations](#operations)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**legend-transactional** provides type-safe, event-driven microservice communication using RabbitMQ with:

- **Saga Pattern**: Multi-step distributed transactions
- **Pub/Sub Events**: Headers-based routing for flexible event subscriptions
- **Automatic Audit Logging**: Transparent event lifecycle tracking (NEW in 2.3.0)
- **Retry Mechanisms**: Fibonacci and linear backoff strategies
- **Type Safety**: Full TypeScript type checking for commands, events, and payloads

**Key Use Case**: Coordinate distributed transactions across 16+ microservices in production (auth, coins, social, missions, rankings, room management, blockchain, etc.)

---

## Architecture

### High-Level Flow

```
Producer → RabbitMQ Exchanges → Queues → Consumer
                ↓
        Automatic Audit Logging
```

### Exchange Types

1. **Events Exchange** (headers) - Pub/sub for regular events
2. **Commands Exchange** (direct) - Saga step commands
3. **Saga Exchange** (direct) - Saga orchestration
4. **Requeue Exchange** (direct) - Failed message retries
5. **Audit Exchange** (direct) - Audit event tracking (NEW)

### Message Flow Patterns

**Event Broadcasting:**

```typescript
publishEvent(payload, 'auth.new_user') → All subscribed microservices
```

**Saga Orchestration:**

```typescript
commenceSaga('purchase_flow', payload) → Step 1 → Step 2 → ... → Complete
```

**Audit Tracking (Automatic):**

```
Event Received → audit.received
Event ACKed → audit.processed
Event NACKed → audit.dead_letter
```

---

## Audit Logging

**Status**: ✅ Implemented in commits `8908783`, `a8ff749` (2025-10-05)

### What It Does

Automatically tracks the complete lifecycle of every event without requiring any manual code from microservice developers.

**Three Audit Events**:

| Event               | When                              | Payload Fields                                                                             |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| `audit.received`    | Event arrives (before processing) | microservice, receivedEvent, receivedAt, queueName, eventId?                               |
| `audit.processed`   | Event successfully ACKed          | microservice, processedEvent, processedAt, queueName, eventId?                             |
| `audit.dead_letter` | Event NACKed (failure)            | microservice, rejectedEvent, rejectedAt, queueName, rejectionReason, retryCount?, eventId? |

**Timestamps**: UNIX seconds (not milliseconds) - `Math.floor(Date.now() / 1000)`

### Infrastructure

**Exchange**: `audit_exchange` (direct)
**Queues**:

- `audit_received_commands` (routing key: `audit.received`)
- `audit_processed_commands` (routing key: `audit.processed`)
- `audit_dead_letter_commands` (routing key: `audit.dead_letter`)

Created automatically when calling `connectToEvents()` - see `src/Consumer/auditInfrastructure.ts:18`

### How It Works

**Emission Points**:

1. **Received**: `src/Consumer/callbacks/event.ts:73-91` - Before user handler
2. **Processed**: `src/Consumer/channels/Events.ts:40-60` - After ACK
3. **Dead Letter**: `src/Consumer/channels/Events.ts:66-120` - On NACK (both delay and Fibonacci strategies)

**Publishing**: `src/Broker/PublishAuditEvent.ts` - Three wrapper functions

**Error Handling**: Audit failures NEVER interrupt the main event flow. All audit publishing is wrapped in try-catch with error logging only.

### Configuration

**Environment Variables**: None required - automatically enabled when using `connectToEvents()`

**Feature Flags**: None - always active for all event consumers

**Microservice**: `audit-eda` added to registry (`src/@types/microservices.ts:17`)

### Usage Example

```typescript
// No code changes needed! Audit tracking is automatic.
const emitter = await connectToEvents({
  url: 'amqp://localhost',
  microservice: 'auth',
  events: ['social.new_user'],
});

emitter.on('social.new_user', async ({ channel, payload }) => {
  // audit.received already emitted automatically
  try {
    await processUser(payload);
    channel.ackMessage(); // → audit.processed emitted automatically
  } catch (error) {
    channel.nackWithFibonacciStrategy(); // → audit.dead_letter emitted automatically
  }
});
```

### Observability

**RabbitMQ Management UI** (`http://localhost:15672`):

- Monitor queue depths for audit events
- Inspect message payloads in audit queues
- Verify routing (exchange → queue bindings)

**Logs**: Search for `"Failed to emit audit"` if audit publishing fails (main flow continues)

**Metrics** (Future): Event counts, failed audit emissions, latency

### Failure Modes

| Scenario            | Behavior                       | Recovery                                  |
| ------------------- | ------------------------------ | ----------------------------------------- |
| Audit exchange down | Log error, continue processing | Audit resumes when exchange recovers      |
| Audit queue full    | RabbitMQ backpressure          | Monitor queue depth, scale audit consumer |
| Audit publish fails | Log error, continue processing | Check RabbitMQ connection, review logs    |

### Operational Runbook

**Verify Audit Setup**:

1. Start any microservice with `connectToEvents()`
2. Check RabbitMQ UI for `audit_exchange` and 3 queues
3. Publish test event
4. Verify 2 audit events appear (received + processed)

**Troubleshoot Missing Audits**:

1. Check RabbitMQ connection: `rabbitmqctl status`
2. Review logs for "Failed to emit audit" messages
3. Verify queue bindings in RabbitMQ UI
4. Confirm timestamps are seconds, not milliseconds

**Query Audit Events** (Future):

- Implement `audit-eda` consumer microservice
- Store events in database
- Build query API for audit trails

---

## Project Structure

### Key Directories

```
packages/legend-transac/src/
├── @types/                    # TypeScript definitions
│   ├── event/events.ts        # 35+ event types + 3 audit events
│   ├── saga/commands/         # 16 microservice command sets
│   └── microservices.ts       # 17 microservices (includes audit-eda)
├── Broker/                    # Message publishing
│   ├── PublishToExchange.ts   # Regular events (headers exchange)
│   ├── PublishAuditEvent.ts   # Audit events (direct exchange)
│   └── SendToQueue.ts         # Saga commands
├── Consumer/                  # Message consumption
│   ├── callbacks/event.ts     # Event handler (+ audit.received)
│   ├── channels/Events.ts     # Event channel (+ audit.processed/dead_letter)
│   └── auditInfrastructure.ts # Audit exchange/queue setup
├── Connections/               # RabbitMQ connections
│   └── start.ts               # Main API (Transactional, Saga classes)
└── utils/
    ├── extractMicroservice.ts # Extract service name from queue
    └── fibonacci.ts           # Retry backoff calculation
```

### Finding Things

| Task               | File(s)                                                        |
| ------------------ | -------------------------------------------------------------- |
| Add new event      | `@types/event/events.ts`                                       |
| Add microservice   | `@types/microservices.ts`, `@types/saga/commands/{service}.ts` |
| Add saga           | `@types/saga/commence.ts`                                      |
| Modify retry logic | `constants.ts`, `Consumer/channels/Consume.ts`                 |
| Audit setup        | `Consumer/auditInfrastructure.ts`                              |
| Main library API   | `Connections/start.ts`                                         |

---

## Core Components

### Broker Module

**Location**: `src/Broker/`

**Key Functions**:

- `publishEvent<T>(payload, event)` - Broadcast to all subscribers (headers exchange)
- `publishAuditEvent<T>(payload, eventType)` - Publish audit event (direct exchange)
- `commenceSaga<T>(title, payload)` - Start distributed transaction
- `sendToQueue<T>(queue, payload)` - Low-level queue send

### Consumer Module

**Location**: `src/Consumer/`

**Channel Classes**:

- `ConsumeChannel` (abstract) - Base with ACK/NACK + retry logic
- `EventsConsumeChannel` - Event subscriber (extends ConsumeChannel, adds audit emission)
- `MicroserviceConsumeChannel` - Saga step handler
- `SagaConsumeChannel` - Saga orchestrator

**Retry Methods**:

- `nackWithDelay(delay, maxRetries)` - Linear backoff
- `nackWithFibonacciStrategy(maxOccurrence?, maxRetries?)` - Exponential backoff

### Connections Module

**Location**: `src/Connections/start.ts`

**Main Classes**:

```typescript
// Saga orchestrator (all steps + commence)
const transactional = new Transactional(url);
const stepEmitter = await transactional.startGlobalSagaStepListener();
const commenceEmitter = await transactional.commenceSagaListener();

// Microservice (saga commands + events)
const saga = new Saga({ url, microservice: 'auth', events: ['social.new_user'] });
const commands = await saga.connectToSagaCommandEmitter();
const events = await saga.connectToEvents();
```

**Standalone Functions**:

- `connectToEvents(config)` - Subscribe to events (auto-creates audit infrastructure)
- `connectToSagaCommandEmitter(config)` - Listen for saga commands
- `startGlobalSagaStepListener(url)` - Saga orchestrator step listener
- `commenceSagaListener(url)` - Saga orchestrator commence listener

---

## Event System

**Total Events**: 38 (35 regular + 3 audit)

**Categories**: Auth, Coins, Missions, Rankings, Room, Social, Storage, Audit

**Common Events**:

- `auth.new_user`, `auth.deleted_user`, `auth.logout_user`, `auth.blocked_user`
- `coins.update_subscription`, `coins.notify_client`, `coins.send_email`
- `social.new_user`, `social.updated_user`, `social.block_chat`
- `audit.received`, `audit.processed`, `audit.dead_letter` (NEW)

**See**: `src/@types/event/events.ts` for complete list

### Adding an Event

**1. Define payload** (`events.ts:134`):

```typescript
export interface EventPayload {
  'myservice.new_action': { userId: string; data: string };
}
```

**2. Add constant** (`events.ts:401`):

```typescript
export const microserviceEvent = {
  'MYSERVICE.NEW_ACTION': 'myservice.new_action',
} as const;
```

**3. Publish**:

```typescript
await publishEvent({ userId: '123', data: 'test' }, 'myservice.new_action');
```

**4. Subscribe**:

```typescript
const emitter = await connectToEvents({ url, microservice: 'auth', events: ['myservice.new_action'] });
emitter.on('myservice.new_action', async ({ channel, payload }) => {
  // Process event
  channel.ackMessage();
});
```

---

## Saga Orchestration

### Current Sagas

1. `purchase_resource_flow` - Virtual resource purchase
2. `rankings_users_reward` - Distribute ranking rewards
3. `transfer_crypto_reward_to_mission_winner` - Crypto to mission winner
4. `transfer_crypto_reward_to_ranking_winners` - Crypto to ranking winners

**Location**: `src/@types/saga/commence.ts`

### Lifecycle

```
commenceSaga() → Step 1 (ACK) → Step 2 (ACK) → ... → Complete
                     ↓ NACK (failure)
                Retry with delay → Max retries → Failed
```

### Adding a Saga

**1. Define title** (`saga/commence.ts:3`):

```typescript
export const sagaTitle = { MyNewSaga: 'my_new_saga' } as const;
```

**2. Define payload** (`saga/commence.ts:26`):

```typescript
export interface SagaCommencePayload {
  ['my_new_saga']: { userId: string; amount: number };
}
```

**3. Add commands** (create `saga/commands/myservice.ts`):

```typescript
export const MyServiceCommands = { ProcessStep: 'my_new_saga:process_step' } as const;
```

**4. Update CommandMap** (`saga/commands/commands.ts`):

```typescript
export interface CommandMap {
  [availableMicroservices.MyService]: MyServiceCommands;
}
```

**5. Implement orchestrator** (in saga app):

```typescript
commenceEmitter.on('my_new_saga', async ({ channel, saga }) => {
  await sendToQueue('myservice_queue', { microservice: 'myservice', command: 'my_new_saga:process_step', ... });
  channel.ackMessage();
});
```

**6. Implement step handler** (in microservice):

```typescript
commandEmitter.on('my_new_saga:process_step', async ({ channel, payload }) => {
  try {
    await processStep(payload);
    channel.ackMessage({ result: ... });
  } catch (error) {
    channel.nackWithFibonacciStrategy();
  }
});
```

---

## Development

### Prerequisites

- Node.js ≥22.0.0
- pnpm ≥10.0.0
- RabbitMQ (local or remote)

### Installation

```bash
git clone https://github.com/legendaryum-metaverse/legend-transactional.git
cd legend-transactional
pnpm install
pnpm build
```

### Monorepo Scripts

```bash
pnpm build      # Build all packages
pnpm type-check # TypeScript validation
pnpm lint       # ESLint
pnpm lint:fix   # Auto-fix linting
pnpm format     # Prettier formatting
pnpm clean      # Remove build artifacts
```

### Running Example Apps

```bash
# Saga orchestrator
cd apps/saga && PORT=3090 RABBIT_URI=amqp://localhost pnpm dev

# Image microservice
cd apps/image && PORT=3020 RABBIT_URI=amqp://localhost pnpm dev

# Mint microservice
cd apps/mint && PORT=3030 RABBIT_URI=amqp://localhost pnpm dev
```

### Environment Variables

| Variable     | Description                  | Default                             |
| ------------ | ---------------------------- | ----------------------------------- |
| `RABBIT_URI` | RabbitMQ connection string   | `amqp://rabbit:1234@localhost:5672` |
| `PORT`       | HTTP server port (apps only) | `3090`, `3020`, `3030`              |

### Quality Checks

**CI/CD validates**:

1. Type checking (`pnpm type-check`)
2. Linting (`pnpm lint`)
3. Formatting (`pnpm format`)
4. Build success (`pnpm build`)
5. Changeset presence (for PRs)

**Pre-commit checklist**:

- [ ] `pnpm type-check` passes
- [ ] `pnpm lint:fix` applied
- [ ] `pnpm format` applied
- [ ] `pnpm build` succeeds
- [ ] Example apps run (if applicable)
- [ ] Changeset created (`pnpm changeset`)

---

## Operations

### Publishing to npm

**Automated** (recommended):

1. Merge PR with changeset to `main`
2. GitHub Action creates "Version Packages" PR
3. Merge version PR → Auto-publish to npm

**Manual**:

```bash
pnpm changeset         # Create changeset
pnpm changeset version # Update package.json + CHANGELOG
cd packages/legend-transac
pnpm build
npm publish --access public
```

**Versioning** (SemVer):

- **Patch** (2.2.3 → 2.2.4): Bug fixes, event additions
- **Minor** (2.2.3 → 2.3.0): New features, audit logging
- **Major** (2.2.3 → 3.0.0): Breaking changes

### Monitoring

**RabbitMQ Management UI**: `http://localhost:15672` (guest/guest)

- View queue depths
- Inspect message headers (`x-retry-count`, `x-occurrence`)
- Monitor audit queues

**Logs**: Search for:

- `"Failed to emit audit"` - Audit publishing failures
- `"Error consuming"` - Consumer errors
- `NACK` - Message retry events

---

## Troubleshooting

### Connection Issues

**Error**: `ECONNREFUSED`

**Causes**:

- RabbitMQ not running
- Wrong `RABBIT_URI`

**Fix**:

```bash
sudo systemctl status rabbitmq-server
sudo systemctl start rabbitmq-server
echo $RABBIT_URI # Verify format: amqp://user:pass@host:port
```

### Messages Not Consumed

**Symptoms**:

- Queue filling up
- No logs in consumer

**Debug**:

1. Check RabbitMQ UI for queue bindings
2. Verify consumer is running
3. Test with wildcard listener: `emitter.on('*', (event, data) => console.log(event))`
4. Check queue name matches microservice

### Type Errors After Adding Event

**Error**: `Type 'X' is not assignable to 'MicroserviceEvent'`

**Fix**: Add event to BOTH places in `events.ts`:

1. `EventPayload` interface
2. `microserviceEvent` constant (← often forgotten!)

### Saga Steps Not Executing

**Debug**:

1. Log all events: `commenceEmitter.on('*', (title, data) => console.log(title))`
2. Verify queue names: `console.log(getQueueConsumer('myservice'))`
3. Check RabbitMQ UI for exchange/queue bindings
4. Confirm microservice is connected: `connectToSagaCommandEmitter()`

### Message ACKed But Still Requeuing

**Cause**: ACK called before async operation completes

**Wrong**:

```typescript
channel.ackMessage(); // ❌ ACK too early
await mightFail(); // If this throws, message is lost
```

**Correct**:

```typescript
try {
  await mightFail();
  channel.ackMessage(); // ✅ ACK only after success
} catch (error) {
  channel.nackWithDelay(2000, 5);
}
```

### Audit Events Missing

**Debug**:

1. Verify audit infrastructure created: Check RabbitMQ UI for `audit_exchange` and 3 queues
2. Review logs for "Failed to emit audit" errors
3. Confirm `connectToEvents()` was called (creates infrastructure)
4. Check timestamps are seconds: `Math.floor(Date.now() / 1000)`, not `Date.now()`

---

## TypeScript Patterns

### Const Assertions

```typescript
export const availableMicroservices = { Auth: 'auth', Coins: 'coins' } as const;
export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
// Type: 'auth' | 'coins' (literal union, not string)
```

### Mapped Types

```typescript
export interface EventPayload {
  'auth.new_user': { id: string; email: string };
}
export type MicroserviceEvent = keyof EventPayload;

// Usage
function publishEvent<T extends MicroserviceEvent>(msg: EventPayload[T], event: T) { ... }
```

### XOR Types (Mutually Exclusive Options)

```typescript
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
export type Nack = XOR<{ delay: number; maxRetries?: number }, { maxOccurrence: number; maxRetries?: number }>;
```

### Abstract Classes

```typescript
abstract class ConsumeChannel {
  public abstract ackMessage(): void;
  public nackWithDelay(delay: number, maxRetries?: number) { ... }
  private nack(options: Nack) { ... }
}
```

---

## Code Review Checklist

### Events

- [ ] Payload in `EventPayload` interface
- [ ] Constant in `microserviceEvent`
- [ ] Name follows `{service}.{action}` pattern

### Saga Commands

- [ ] Command in `{service}Commands` const
- [ ] Command follows `{saga_title}:{action}` naming
- [ ] Mapped in `CommandMap` interface

### Code Quality

- [ ] No `any` types (use `unknown`)
- [ ] Error handling with logging
- [ ] ACK only after success, NACK on failure
- [ ] Appropriate retry strategy (Fibonacci for long-running)

### CI/CD

- [ ] Build succeeds
- [ ] Type check passes
- [ ] Linting passes
- [ ] Changeset added

---

## Additional Resources

**Documentation**:

- NPM: https://www.npmjs.com/package/legend-transactional
- GitHub: https://github.com/legendaryum-metaverse/legend-transactional
- Changelog: `packages/legend-transac/CHANGELOG.md`

**RabbitMQ**:

- Docs: https://www.rabbitmq.com/documentation.html
- Headers Exchange: https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchange-headers

**Saga Pattern**:

- Microservices.io: https://microservices.io/patterns/data/saga.html
- AWS Blog: https://aws.amazon.com/blogs/compute/implementing-saga-pattern-with-aws-step-functions/

---

**Generated**: 2025-10-05 | **Version**: 2.2.3 → 2.3.0 (audit logging added)
