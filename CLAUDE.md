# 📚 legend-transactional - TypeScript Implementation Guide

**Version:** 2.2.3 (Production)
**Status:** ✅ Published to npm
**Language:** TypeScript
**Primary Use:** RabbitMQ-based microservice orchestration with Saga patterns

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Architecture](#-architecture)
3. [Project Structure](#-project-structure)
4. [Core Components](#-core-components)
5. [Event System](#-event-system)
6. [Saga Orchestration](#-saga-orchestration)
7. [Microservices Registry](#-microservices-registry)
8. [Development Guide](#-development-guide)
9. [Code Metrics](#-code-metrics)
10. [TypeScript Patterns](#-typescript-patterns)
11. [Common Tasks](#-common-tasks)
12. [Debugging Guide](#-debugging-guide)

---

## 🎯 Overview

**legend-transactional** is a production-ready TypeScript library for building event-driven microservice architectures using RabbitMQ. It provides:

- **Saga Pattern Implementation**: Coordinate multi-step distributed transactions
- **Event-Driven Communication**: Pub/Sub messaging between microservices
- **Type-Safe APIs**: Full TypeScript type safety for commands, events, and payloads
- **Retry Mechanisms**: Fibonacci and linear backoff strategies
- **Headers-Based Routing**: Flexible message routing using RabbitMQ headers exchange

### Key Features

✅ Type-safe microservice communication
✅ Distributed transaction orchestration (Sagas)
✅ Event publishing/subscription with filtering
✅ Automatic retry with exponential backoff
✅ Durable queues and exchanges
✅ Monorepo structure with example apps
✅ Production-tested in Legendaryum metaverse platform

---

## 🏗️ Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Microservices"
        MS1[Auth Service]
        MS2[Coins Service]
        MS3[Social Service]
        MS4[Image Service]
    end

    subgraph "RabbitMQ"
        EX1[Commands Exchange<br/>direct]
        EX2[Events Exchange<br/>headers]
        EX3[Saga Exchange<br/>direct]
        EX4[Requeue Exchange<br/>direct]
    end

    subgraph "Saga Orchestrator"
        SO[Saga Service]
    end

    MS1 -->|Commands| EX1
    MS2 -->|Publish Events| EX2
    EX2 -->|Subscribe| MS3
    SO -->|Orchestrate| EX3
    EX3 -->|Saga Steps| MS4
    MS4 -->|Failed Messages| EX4
    EX4 -->|Retry with Delay| EX1
```

### Message Flow Types

**1. Event Broadcasting** (`packages/legend-transac/src/Broker/PublishToExchange.ts:24`)

```typescript
publishEvent(payload, 'auth.new_user')
  → Headers Exchange → All subscribed microservices
```

**2. Saga Commands** (`packages/legend-transac/src/Connections/start.ts:249`)

```typescript
connectToSagaCommandEmitter({ microservice: 'auth', ... })
  → Direct Exchange → Specific microservice queue
```

**3. Saga Orchestration** (`packages/legend-transac/src/Broker/SendToQueue.ts:41`)

```typescript
commenceSaga('purchase_resource_flow', payload)
  → Saga Queue → Saga Orchestrator → Multi-step transaction
```

### Component Interactions

```mermaid
sequenceDiagram
    participant Client
    participant Saga as Saga Orchestrator
    participant MS1 as Microservice 1
    participant MS2 as Microservice 2
    participant RMQ as RabbitMQ

    Client->>Saga: commenceSaga(title, payload)
    Saga->>RMQ: Publish to CommenceSaga Queue
    Saga->>MS1: Send Step 1 Command
    MS1->>MS1: Process Step 1
    MS1->>Saga: ACK + Payload for Next Step
    Saga->>MS2: Send Step 2 Command
    MS2->>MS2: Process Step 2
    MS2--xSaga: NACK (Failure)
    Saga->>RMQ: Requeue with Fibonacci Delay
    Note over Saga,RMQ: Retry after delay
    RMQ->>MS2: Retry Step 2
    MS2->>Saga: ACK (Success)
```

---

## 📂 Project Structure

```
legend-transactional/
├── packages/
│   └── legend-transac/              # Main library package
│       ├── src/
│       │   ├── @types/              # Type definitions
│       │   │   ├── event/           # Event types and payloads
│       │   │   │   ├── events.ts    # 35+ event definitions
│       │   │   │   └── consumer.ts  # Consumer types
│       │   │   ├── saga/            # Saga-related types
│       │   │   │   ├── saga.ts      # Saga handler types
│       │   │   │   ├── sagaStep.ts  # Step status & structure
│       │   │   │   ├── commence.ts  # Saga initiation types
│       │   │   │   ├── microservice.ts # Microservice mappings
│       │   │   │   └── commands/    # 16 microservice command sets
│       │   │   │       ├── auth.ts
│       │   │   │       ├── coins.ts
│       │   │   │       ├── social.ts
│       │   │   │       └── ... (13 more)
│       │   │   ├── microservices.ts # 16 microservice definitions
│       │   │   └── rabbit-mq.ts     # RabbitMQ types
│       │   ├── Broker/              # Message publishing
│       │   │   ├── SendToQueue.ts   # Send to specific queue
│       │   │   ├── PublishToExchange.ts # Broadcast events
│       │   │   └── sendChannel.ts   # Channel management
│       │   ├── Consumer/            # Message consumption
│       │   │   ├── create.ts        # Create consumers
│       │   │   ├── consume.ts       # Consume messages
│       │   │   ├── channels/        # Channel types
│       │   │   │   ├── Consume.ts   # Base consume channel
│       │   │   │   ├── Step.ts      # Saga step channel
│       │   │   │   ├── Events.ts    # Event channel
│       │   │   │   └── CommenceSaga.ts # Saga commence channel
│       │   │   └── callbacks/       # Message handlers
│       │   │       ├── sagaStep.ts  # Saga step callback
│       │   │       ├── saga.ts      # Saga callback
│       │   │       ├── event.ts     # Event callback
│       │   │       └── commenceSaga.ts # Commence saga callback
│       │   ├── Connections/         # RabbitMQ connections
│       │   │   ├── start.ts         # Main library API (355 lines)
│       │   │   ├── rabbitConn.ts    # Connection management
│       │   │   ├── consumeChannel.ts # Consume channel factory
│       │   │   └── stop.ts          # Cleanup & shutdown
│       │   ├── utils/               # Utilities
│       │   │   ├── fibonacci.ts     # Retry backoff calculation
│       │   │   └── getters.ts       # Helper functions
│       │   ├── constants.ts         # Global constants
│       │   └── index.ts             # Public API exports
│       ├── dist/                    # Compiled output (CJS + ESM)
│       ├── package.json             # Library metadata
│       └── tsconfig.json
├── apps/                            # Example applications
│   ├── saga/                        # Saga orchestrator example
│   │   └── src/
│   │       ├── server.ts            # Express server + saga listener
│   │       └── handler.ts           # Saga command handler
│   ├── image/                       # Image microservice example
│   └── mint/                        # Mint microservice example
├── actions/
│   └── check-changeset/             # GitHub Actions for PR checks
├── package.json                     # Monorepo root
├── turbo.json                       # Turborepo config
└── pnpm-workspace.yaml
```

### Key Files by Purpose

| **Purpose**              | **File**                                | **When to Modify**          |
| ------------------------ | --------------------------------------- | --------------------------- |
| **Add New Event**        | `src/@types/event/events.ts`            | Adding new pub/sub event    |
| **Add New Microservice** | `src/@types/microservices.ts`           | Onboarding new service      |
| **Add Saga Commands**    | `src/@types/saga/commands/{service}.ts` | New saga step for service   |
| **Add Saga Title**       | `src/@types/saga/commence.ts`           | New distributed transaction |
| **Retry Configuration**  | `src/constants.ts`                      | Adjust retry behavior       |
| **Main API**             | `src/Connections/start.ts`              | Core functionality changes  |
| **Publishing**           | `src/Broker/PublishToExchange.ts`       | Event publishing logic      |
| **Consuming**            | `src/Consumer/callbacks/*`              | Message handling logic      |

---

## ⚙️ Core Components

### 1. Broker Module

**Purpose**: Send messages to RabbitMQ
**Location**: `packages/legend-transac/src/Broker/`

#### Key Functions

**`publishEvent<T>(msg, event)`** (`PublishToExchange.ts:24`)

- Broadcasts events to all subscribed microservices
- Uses RabbitMQ **headers exchange** for routing
- Example:
  ```typescript
  await publishEvent({ userId: '123', email: 'user@example.com' }, 'auth.new_user');
  ```

**`commenceSaga<U>(title, payload)`** (`SendToQueue.ts:41`)

- Initiates a new saga transaction
- Sends message to `CommenceSaga` queue
- Example:
  ```typescript
  await commenceSaga('purchase_resource_flow', {
    userId: '456',
    resourceId: 'res_789',
    price: 100,
    quantity: 1,
  });
  ```

**`sendToQueue<T>(queueName, payload)`** (`SendToQueue.ts:12`)

- Low-level queue message sending
- Used internally by `commenceSaga`

---

### 2. Consumer Module

**Purpose**: Receive and process messages from RabbitMQ
**Location**: `packages/legend-transac/src/Consumer/`

#### Channel Types

**`ConsumeChannel`** (`channels/Consume.ts:16`) - Abstract base class

- Provides `ackMessage()` and NACK methods
- `nackWithDelay(delay, maxRetries)` - Linear backoff
- `nackWithFibonacciStrategy(maxOccurrence, maxRetries)` - Exponential backoff

**`MicroserviceConsumeChannel<T>`** (`channels/Step.ts`)

- For saga step commands sent to microservices
- Inherits retry mechanisms from `ConsumeChannel`

**`SagaConsumeChannel<T>`** (`channels/CommenceSaga.ts`)

- For saga orchestrator receiving step results

**`EventConsumeChannel`** (`channels/Events.ts`)

- For event subscribers

#### Callback Functions

**`sagaStepCallback`** (`callbacks/sagaStep.ts:16`)

- Handles saga commands for microservices
- Parses `SagaStep<T>` from message
- Emits command to appropriate handler

**`eventCallback`** (`callbacks/event.ts`)

- Handles published events
- Uses headers matching for routing

**`commenceSagaCallback`** (`callbacks/commenceSaga.ts`)

- Handles saga initiation messages
- Starts saga orchestration

---

### 3. Connections Module

**Purpose**: Manage RabbitMQ connections
**Location**: `packages/legend-transac/src/Connections/`

#### Main API (`start.ts`)

**`Transactional<T, U>` Class** (Line 172)

- Combines saga step listener + commence saga listener
- Usage:
  ```typescript
  const transactional = new Transactional('amqp://localhost');
  const stepEmitter = await transactional.startGlobalSagaStepListener();
  const commenceEmitter = await transactional.commenceSagaListener();
  ```

**`Saga<T, U>` Class** (Line 340)

- Combines saga commands + event subscriptions for a microservice
- Usage:
  ```typescript
  const saga = new Saga({
    url: 'amqp://localhost',
    microservice: 'auth',
    events: ['social.new_user', 'coins.update_subscription'],
  });
  const commands = await saga.connectToSagaCommandEmitter();
  const events = await saga.connectToEvents();
  ```

**`connectToSagaCommandEmitter<T>(config)`** (Line 249)

- Connect specific microservice to saga commands
- Returns emitter for handling commands

**`connectToEvents<T, U>(config)`** (Line 297)

- Subscribe to specific events from a microservice
- Uses headers matching for filtering

**`startGlobalSagaStepListener<T>(url)`** (Line 86)

- Saga orchestrator listens to all step results
- Returns emitter for all microservice commands

**`commenceSagaListener<U>(url)`** (Line 134)

- Saga orchestrator listens to initiation requests

---

### 4. Types Module (`@types/`)

**Purpose**: Complete type definitions for type safety
**Location**: `packages/legend-transac/src/@types/`

#### Event System Types

**`EventPayload` Interface** (`event/events.ts:134`)

- Maps 35+ event names to their payload types
- Example:
  ```typescript
  EventPayload['auth.new_user'] = {
    id: string;
    email: string;
    username: string;
    userlastname: string;
  }
  ```

**`MicroserviceEvent` Type** (`event/events.ts:440`)

- Union type of all event names
- Derived from `microserviceEvent` constant object

#### Saga Types

**`SagaStep<T>` Interface** (`saga/sagaStep.ts:55`)

```typescript
interface SagaStep<T extends AvailableMicroservices> {
  microservice: T;
  command: CommandMap[T];
  status: 'pending' | 'success' | 'failure' | 'sent';
  sagaId: number;
  payload: Record<string, unknown>;
  previousPayload: Record<string, unknown>;
  isCurrentStep: boolean;
}
```

**`CommandMap` Interface** (`saga/commands/commands.ts:21`)

- Maps microservices to their command types
- Example: `CommandMap['auth'] = AuthCommands`

**`SagaTitle` Type** (`saga/commence.ts:24`)

- 4 predefined saga workflows:
  - `purchase_resource_flow`
  - `rankings_users_reward`
  - `transfer_crypto_reward_to_mission_winner`
  - `transfer_crypto_reward_to_ranking_winners`

**`SagaCommencePayload` Interface** (`saga/commence.ts:26`)

- Maps saga titles to their initialization payloads

---

## 🎪 Event System

### Supported Events (35+)

**Location**: `packages/legend-transac/src/@types/event/events.ts`

#### Categories

**Authentication Events**

- `auth.new_user` - User creation
- `auth.deleted_user` - User deletion
- `auth.logout_user` - User logout
- `auth.blocked_user` - User blocked (permanent/temporary)

**Coins/Payment Events**

- `coins.update_subscription` - Subscription updated
- `coins.notify_client` - WebSocket notification
- `coins.send_email` - Payment email

**Missions Events**

- `legend_missions.completed_mission_reward` - Mission completed
- `legend_missions.new_mission_created` - New mission
- `legend_missions.mission_finished` - Mission ended
- `legend_missions.send_email_crypto_mission_completed` - Crypto reward email
- `legend_missions.send_email_nft_mission_completed` - NFT reward email

**Rankings Events**

- `legend_rankings.rankings_finished` - Rankings completed
- `legend_rankings.new_ranking_created` - New ranking
- `legend_rankings.intermediate_reward` - Intermediate reward

**Room Events**

- `room_creator.created_room` - Room created
- `room_creator.updated_room` - Room updated
- `room_snapshot.first_snapshot` - First snapshot saved
- `room_snapshot.building_change_in_island` - Building changed

**Social Events**

- `social.new_user` - Social profile created
- `social.updated_user` - Social profile updated
- `social.block_chat` - Chat blocked
- `social.unblock_chat` - Chat unblocked

### Adding a New Event

**1. Define Event Payload** (`event/events.ts:134`)

```typescript
export interface EventPayload {
  // ... existing events
  'myservice.new_action': {
    userId: string;
    actionData: string;
  };
}
```

**2. Add Event Constant** (`event/events.ts:401`)

```typescript
export const microserviceEvent = {
  // ... existing events
  'MYSERVICE.NEW_ACTION': 'myservice.new_action',
} as const;
```

**3. Publish the Event**

```typescript
import { publishEvent } from 'legend-transactional';

await publishEvent({ userId: '123', actionData: 'test' }, 'myservice.new_action');
```

**4. Subscribe to the Event**

```typescript
const emitter = await connectToEvents({
  url: 'amqp://localhost',
  microservice: 'auth',
  events: ['myservice.new_action'],
});

emitter.on('myservice.new_action', async ({ channel, payload }) => {
  console.log('Received:', payload);
  channel.ackMessage();
});
```

---

## 🔄 Saga Orchestration

### What is a Saga?

A **saga** is a distributed transaction pattern that coordinates multiple microservice operations as a single logical transaction. Each step can succeed or fail independently, with compensation logic to handle failures.

### Current Sagas (4)

**Location**: `packages/legend-transac/src/@types/saga/commence.ts:3`

1. **`purchase_resource_flow`**
   - Purpose: Buy virtual resources, deduct coins
   - Steps: Coins → Room-Snapshot

2. **`rankings_users_reward`**
   - Purpose: Distribute coins to ranking winners
   - Steps: Coins service batch rewards

3. **`transfer_crypto_reward_to_mission_winner`**
   - Purpose: Transfer cryptocurrency to mission winner
   - Steps: Blockchain → Wallet transfer

4. **`transfer_crypto_reward_to_ranking_winners`**
   - Purpose: Batch crypto transfers to ranking winners
   - Steps: Blockchain → Multiple wallet transfers

### Saga Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Commence: commenceSaga()
    Commence --> Step1: Send command to MS1
    Step1 --> Step2: ACK + payload
    Step2 --> Step3: ACK + payload
    Step3 --> Complete: Final ACK

    Step1 --> Retry: NACK (failure)
    Step2 --> Retry: NACK (failure)
    Step3 --> Retry: NACK (failure)

    Retry --> Step1: After delay
    Retry --> Step2: After delay
    Retry --> Step3: After delay

    Retry --> Failed: Max retries exceeded
    Complete --> [*]
    Failed --> [*]
```

### Adding a New Saga

**1. Define Saga Title** (`saga/commence.ts:3`)

```typescript
export const sagaTitle = {
  // ... existing sagas
  MyNewSaga: 'my_new_saga',
} as const;
```

**2. Define Payload Type** (`saga/commence.ts:26`)

```typescript
export interface SagaCommencePayload {
  // ... existing payloads
  ['my_new_saga']: {
    userId: string;
    itemId: string;
    amount: number;
  };
}
```

**3. Define Commands for Each Step**

Create `src/@types/saga/commands/myservice.ts`:

```typescript
export const MyServiceCommands = {
  ProcessMyStep: 'my_new_saga:process_step',
} as const;

export type MyServiceCommands = (typeof MyServiceCommands)[keyof typeof MyServiceCommands];
```

**4. Update Command Map** (`saga/commands/commands.ts`)

```typescript
import { MyServiceCommands } from './myservice';

export interface CommandMap {
  // ... existing mappings
  [availableMicroservices.MyService]: MyServiceCommands;
}
```

**5. Implement Saga Orchestrator Handler**

```typescript
const commenceEmitter = await commenceSagaListener('amqp://localhost');

commenceEmitter.on('my_new_saga', async ({ channel, saga }) => {
  const { userId, itemId, amount } = saga.payload;

  // Start saga steps
  const step1 = createSagaStep({
    microservice: 'myservice',
    command: 'my_new_saga:process_step',
    sagaId: generateSagaId(),
    payload: { userId, itemId, amount },
  });

  await sendToQueue('myservice_queue', step1);
  channel.ackMessage();
});
```

**6. Implement Microservice Handler**

```typescript
const commandEmitter = await connectToSagaCommandEmitter({
  url: 'amqp://localhost',
  microservice: 'myservice',
  events: [],
});

commandEmitter.on('my_new_saga:process_step', async ({ channel, sagaId, payload }) => {
  try {
    // Process the step
    const result = await processStep(payload);

    // ACK with result for next step
    channel.ackMessage({ result });
  } catch (error) {
    // NACK to retry with Fibonacci backoff
    channel.nackWithFibonacciStrategy();
  }
});
```

---

## 🔧 Microservices Registry

**Location**: `packages/legend-transac/src/@types/microservices.ts`

### Available Microservices (16)

| **Name**             | **Key**          | **Purpose**                      |
| -------------------- | ---------------- | -------------------------------- |
| `test-image`         | TestImage        | Testing purposes                 |
| `test-mint`          | TestMint         | Testing purposes                 |
| `auth`               | Auth             | Authentication & user management |
| `blockchain`         | Blockchain       | Blockchain interactions          |
| `coins`              | Coins            | Virtual currency & payments      |
| `legend-missions`    | Missions         | Mission system                   |
| `rankings`           | Rankings         | Ranking system                   |
| `rapid-messaging`    | RapidMessaging   | Real-time messaging              |
| `room-creator`       | RoomCreator      | Room creation                    |
| `room-inventory`     | RoomInventory    | User inventory management        |
| `room-snapshot`      | RoomSnapshot     | Room state snapshots             |
| `legend-send-email`  | SendEmail        | Email notifications              |
| `legend-showcase`    | Showcase         | Product showcase                 |
| `social`             | Social           | Social features                  |
| `social-media-rooms` | SocialMediaRooms | Social media rooms               |
| `legend-storage`     | Storage          | File storage                     |

### Adding a New Microservice

**1. Update Microservices Definition** (`@types/microservices.ts:5`)

```typescript
export const availableMicroservices = {
  // ... existing microservices
  MyNewService: 'my-new-service',
} as const;
```

**2. Create Command Definitions**

Create `src/@types/saga/commands/my-new-service.ts`:

```typescript
export const MyNewServiceCommands = {
  DoSomething: 'saga:do_something',
  DoAnotherThing: 'saga:do_another_thing',
} as const;

export type MyNewServiceCommands = (typeof MyNewServiceCommands)[keyof typeof MyNewServiceCommands];
```

**3. Update Command Map** (`saga/commands/commands.ts`)

```typescript
import { MyNewServiceCommands } from './my-new-service';

export interface CommandMap {
  // ... existing mappings
  [availableMicroservices.MyNewService]: MyNewServiceCommands;
}
```

**4. Export Commands** (`saga/commands/index.ts`)

```typescript
export * from './my-new-service';
```

**5. Update Queue Utility** (`utils/getters.ts`)

```typescript
export const getQueueConsumer = (microservice: AvailableMicroservices) => {
  const queueName = `${microservice}_commands`;
  return {
    queueName,
    exchange: exchange.Commands,
  };
};
```

---

## 👨‍💻 Development Guide

### Prerequisites

- **Node.js**: >=22.0.0
- **pnpm**: >=10.0.0
- **RabbitMQ**: Running instance (local or remote)

### Installation

```bash
# Clone repository
git clone https://github.com/legendaryum-metaverse/legend-transactional.git
cd legend-transactional

# Install dependencies
pnpm install

# Build library
pnpm build

# Build in dev mode (faster, no minification)
pnpm run build:dev
```

### Monorepo Scripts

```bash
# Run all builds
pnpm build

# Run all tests
pnpm test

# Run type checking
pnpm type-check

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Clean build artifacts
pnpm clean

# Run dev servers (example apps)
pnpm dev
```

### Library-Specific Scripts

```bash
cd packages/legend-transac

# Build library (production)
pnpm build

# Build library (development)
pnpm build:dev

# Type check only
pnpm type-check

# Lint TypeScript files
pnpm lint
```

### Running Example Apps

**Saga Orchestrator:**

```bash
cd apps/saga
PORT=3090 RABBIT_URI=amqp://localhost pnpm dev
```

**Image Microservice:**

```bash
cd apps/image
PORT=3020 RABBIT_URI=amqp://localhost pnpm dev
```

**Mint Microservice:**

```bash
cd apps/mint
PORT=3030 RABBIT_URI=amqp://localhost pnpm dev
```

### Environment Variables

| Variable     | Description                     | Default                                      |
| ------------ | ------------------------------- | -------------------------------------------- |
| `RABBIT_URI` | RabbitMQ connection string      | `amqp://rabbit:1234@localhost:5672`          |
| `PORT`       | HTTP server port (example apps) | `3090` (saga), `3020` (image), `3030` (mint) |

---

## 🧪 Testing & Quality Assurance

### Important Note

**The main library (`packages/legend-transac`) does not have unit tests.** Quality is ensured through:

1. **Type Safety** - TypeScript compiler validation
2. **CI/CD Checks** - Automated linting, formatting, and build verification
3. **Example Apps** - Manual testing with `apps/saga`, `apps/image`, `apps/mint`

### Manual Testing with Example Apps

The example applications demonstrate library usage and can be used for manual testing:

**Location**: `apps/saga/`, `apps/image/`, `apps/mint/`

**Setup for Manual Testing**:

1. **Start RabbitMQ**:

   ```bash
   docker-compose up -d rabbitmq
   ```

2. **Run Example Apps** (in separate terminals):

   ```bash
   # Saga Orchestrator
   cd apps/saga && PORT=3090 pnpm dev
   
   # Image Microservice
   cd apps/image && PORT=3020 pnpm dev
   
   # Mint Microservice
   cd apps/mint && PORT=3030 pnpm dev
   ```

3. **Verify**:
   - Check RabbitMQ UI: `http://localhost:15672` (guest/guest)
   - Observe message flow and queue behavior
   - Test ACK/NACK retry mechanisms

### CI/CD Quality Checks

**Workflows**: `.github/workflows/`

- `release.yml` - Release automation with changesets
- `new-pr-to-main.yaml` - PR validation
- `code-quality-check.yml` - Linting and type checking
- `check-dependencies.yml` - Dependency updates

**Automated Checks on PR**:

1. **Type Checking** (`pnpm run type-check`)
   - Validates TypeScript types across all packages
   - Ensures type safety at compile time

2. **Linting** (`pnpm run lint`)
   - ESLint validation
   - Automatically fixed with `pnpm run lint:fix`

3. **Formatting** (`pnpm run format`)
   - Prettier code formatting
   - Auto-applied on lint workflow

4. **Build Verification** (`pnpm run build`)
   - Ensures all packages build successfully
   - Validates exports and module resolution

5. **Changeset Validation**
   - Ensures PR includes changeset for version bump
   - Prevents merging without version update

### Running Quality Checks Locally

```bash
# Type check all packages
pnpm run type-check

# Lint all packages
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format all files
pnpm run format

# Build all packages
pnpm run build
```

### Pre-Commit Checklist

When making changes, verify:

- [ ] TypeScript types are correct: `pnpm run type-check`
- [ ] Code is linted: `pnpm run lint`
- [ ] Code is formatted: `pnpm run format`
- [ ] Build succeeds: `pnpm run build`
- [ ] Example apps run without errors (if applicable)
- [ ] Changeset added for library changes: `pnpm changeset`

---

## 📊 Code Metrics

### Overall Statistics

- **Total TypeScript Files**: 57
- **Total Lines of Code**: ~2,571
- **Microservices Supported**: 16
- **Events Defined**: 35+
- **Saga Titles**: 4
- **Command Sets**: 16 (one per microservice)

### File Size Distribution

| **Component**     | **Files** | **Approximate LOC**  |
| ----------------- | --------- | -------------------- |
| Types (`@types/`) | 21        | ~1,200               |
| Connections       | 4         | ~500 (start.ts: 355) |
| Consumer          | 10        | ~400                 |
| Broker            | 3         | ~100                 |
| Utils             | 2         | ~50                  |
| Constants         | 1         | ~50                  |

### Complexity Hotspots

**Most Complex Files** (by line count & logic):

1. `Connections/start.ts` (355 lines) - Main API
2. `@types/event/events.ts` (~400 lines) - Event definitions
3. `Consumer/channels/Consume.ts` (182 lines) - Retry logic
4. `@types/saga/commands/commands.ts` (104 lines) - Command mappings

### Dependencies

**Runtime Dependencies**:

- `amqplib` (^0.10.9) - RabbitMQ client
- `@types/amqplib` (^0.10.7) - TypeScript types
- `mitt` (latest) - Event emitter

**Dev Dependencies**:

- `typescript` (^5.9.3)
- `tsup` (latest) - Build tool
- `eslint` (^9.36.0)
- `jest` (^29.7.0)
- `turbo` (^2.5.8) - Monorepo orchestration

---

## 🎨 TypeScript Patterns

### 1. Const Assertions for Type Safety

**Pattern**: Use `as const` to create readonly literal types

```typescript
// microservices.ts
export const availableMicroservices = {
  Auth: 'auth',
  Coins: 'coins',
} as const;

export type AvailableMicroservices = (typeof availableMicroservices)[keyof typeof availableMicroservices];
// Type: 'auth' | 'coins' (literal union, not string)
```

**Benefits**:

- Autocomplete for microservice names
- Compile-time validation
- No magic strings

### 2. Mapped Types for Event/Command Payloads

**Pattern**: Interface with string literal keys

```typescript
// events.ts
export interface EventPayload {
  'auth.new_user': { id: string; email: string };
  'coins.update_subscription': { userId: string; paidPriceId: string };
}

export type MicroserviceEvent = keyof EventPayload;
```

**Usage**:

```typescript
function publishEvent<T extends MicroserviceEvent>(
  msg: EventPayload[T],  // Inferred payload type
  event: T
) { ... }

// TypeScript enforces correct payload for event
publishEvent({ id: '1', email: 'a@b.com' }, 'auth.new_user'); ✅
publishEvent({ wrong: 'data' }, 'auth.new_user'); ❌ Type error
```

### 3. Generics for Microservice-Specific Types

**Pattern**: Generic types constrained to microservice enum

```typescript
// saga.ts
export interface SagaHandler<T extends AvailableMicroservices> {
  step: SagaStep<T>;
  channel: SagaConsumeChannel<T>;
}

export type SagaConsumeSagaEvents<T extends AvailableMicroservices> = {
  [key in CommandMap[T]]: SagaHandler<T>;
};
```

**Benefits**:

- Type-safe command-to-microservice mapping
- Prevents invalid command/microservice combinations

### 4. Discriminated Unions (Future Enhancement)

**Current Gap**: Events use string literals but don't discriminate at runtime

**Potential Pattern**:

```typescript
type AuthNewUserEvent = {
  type: 'auth.new_user';
  payload: { id: string; email: string };
};

type CoinsUpdateEvent = {
  type: 'coins.update_subscription';
  payload: { userId: string; paidPriceId: string };
};

type Event = AuthNewUserEvent | CoinsUpdateEvent;

function handleEvent(event: Event) {
  if (event.type === 'auth.new_user') {
    // TypeScript narrows to AuthNewUserEvent
    console.log(event.payload.email);
  }
}
```

### 5. Conditional Types for Flexibility

**Pattern**: XOR type for mutually exclusive options

```typescript
// Consume.ts:8
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

export type Nack = XOR<
  { delay: number; maxRetries?: number },
  { maxOccurrence: number; maxRetries?: number }
>;

// Valid:
nackWithDelay(2000, 10); ✅
nackWithFibonacciStrategy(19, 20); ✅

// Invalid (both strategies):
nack({ delay: 2000, maxOccurrence: 19 }); ❌ Type error
```

### 6. Abstract Classes for Shared Behavior

**Pattern**: Abstract base class with template methods

```typescript
// Consume.ts:16
abstract class ConsumeChannel {
  protected readonly channel: Channel;
  protected readonly msg: ConsumeMessage;

  public abstract ackMessage(payloadForNextStep?: Record<string, unknown>): void;

  public nackWithDelay(delay: number, maxRetries?: number) {
    return this.nack({ delay, maxRetries });
  }

  private nack(options: Nack) {
    // Shared retry logic
  }
}

class MicroserviceConsumeChannel extends ConsumeChannel {
  public ackMessage(payloadForNextStep?: Record<string, unknown>) {
    // Microservice-specific ACK logic
  }
}
```

### 7. Utility Types for DRY Code

**Pattern**: Extract common type transformations

```typescript
// saga/sagaStep.ts
export interface SagaStepDefaults {
  status: Status;
  payload: Record<string, unknown>;
  previousPayload: Record<string, unknown>;
  isCurrentStep: boolean;
}

export interface SagaStep<T extends AvailableMicroservices> extends SagaStepDefaults, MicroserviceCommand<T> {
  microservice: T;
  sagaId: number;
}
```

### TypeScript vs Rust Comparison

| **Aspect**           | **TypeScript**            | **Rust**                    |
| -------------------- | ------------------------- | --------------------------- |
| **Type Safety**      | Compile-time only         | Compile-time + runtime      |
| **Enums**            | String literal unions     | First-class enums           |
| **Pattern Matching** | `if`/`switch`             | `match` with exhaustiveness |
| **Error Handling**   | `try/catch`               | `Result<T, E>`              |
| **Async**            | `async/await` (Promises)  | `async/await` (Futures)     |
| **Memory Safety**    | GC (no manual management) | Ownership + borrow checker  |
| **Generics**         | Structural typing         | Trait bounds                |

**Key TS Advantage**: Faster iteration, JavaScript ecosystem
**Key Rust Advantage**: No runtime errors, fearless concurrency

---

## ✅ Common Tasks

### Task 1: Add a New Event

**Scenario**: Add `auth.password_reset` event

**Steps**:

1. **Define Payload** (`@types/event/events.ts:134`)

   ```typescript
   export interface EventPayload {
     // ... existing events
     'auth.password_reset': {
       userId: string;
       resetToken: string;
       expiresAt: string;
     };
   }
   ```

2. **Add Constant** (`@types/event/events.ts:401`)

   ```typescript
   export const microserviceEvent = {
     // ... existing events
     'AUTH.PASSWORD_RESET': 'auth.password_reset',
   } as const;
   ```

3. **Publish Event** (in auth service)

   ```typescript
   import { publishEvent } from 'legend-transactional';

   await publishEvent(
     {
       userId: user.id,
       resetToken: generateToken(),
       expiresAt: new Date(Date.now() + 3600000).toISOString(),
     },
     'auth.password_reset',
   );
   ```

4. **Subscribe to Event** (in email service)

   ```typescript
   import { connectToEvents } from 'legend-transactional';

   const emitter = await connectToEvents({
     url: process.env.RABBIT_URI!,
     microservice: 'legend-send-email',
     events: ['auth.password_reset'],
   });

   emitter.on('auth.password_reset', async ({ channel, payload }) => {
     try {
       await sendPasswordResetEmail(payload);
       channel.ackMessage();
     } catch (error) {
       console.error('Email failed:', error);
       channel.nackWithDelay(5000, 3);
     }
   });
   ```

---

### Task 2: Add a New Microservice

**Scenario**: Add `notifications` microservice

**Steps**:

1. **Update Microservices** (`@types/microservices.ts:5`)

   ```typescript
   export const availableMicroservices = {
     // ... existing microservices
     Notifications: 'notifications',
   } as const;
   ```

2. **Create Command File** (`@types/saga/commands/notifications.ts`)

   ```typescript
   export const NotificationsCommands = {
     SendPushNotification: 'saga:send_push',
     SendSMSNotification: 'saga:send_sms',
   } as const;

   export type NotificationsCommands = (typeof NotificationsCommands)[keyof typeof NotificationsCommands];
   ```

3. **Update Command Map** (`saga/commands/commands.ts`)

   ```typescript
   import { NotificationsCommands } from './notifications';

   export interface CommandMap {
     // ... existing mappings
     [availableMicroservices.Notifications]: NotificationsCommands;
   }
   ```

4. **Export Commands** (`saga/commands/index.ts`)

   ```typescript
   export * from './notifications';
   ```

5. **Implement Microservice**

   ```typescript
   import { connectToSagaCommandEmitter } from 'legend-transactional';

   const emitter = await connectToSagaCommandEmitter({
     url: 'amqp://localhost',
     microservice: 'notifications',
     events: [],
   });

   emitter.on('saga:send_push', async ({ channel, sagaId, payload }) => {
     try {
       await sendPushNotification(payload);
       channel.ackMessage({ sent: true });
     } catch (error) {
       channel.nackWithFibonacciStrategy();
     }
   });
   ```

---

### Task 3: Modify Retry Behavior

**Scenario**: Change Fibonacci max occurrence from 19 to 25

**Steps**:

1. **Update Constant** (`constants.ts:26`)

   ```typescript
   export const MAX_OCCURRENCE = 25; // was 19
   ```

2. **Rebuild Library**

   ```bash
   cd packages/legend-transac
   pnpm build
   ```

3. **Test Retry Behavior**
   ```typescript
   // In a consumer
   emitter.on('some.event', async ({ channel }) => {
     try {
       await riskyOperation();
       channel.ackMessage();
     } catch (error) {
       // Will retry up to 25 occurrences with Fibonacci delay
       channel.nackWithFibonacciStrategy(); // uses MAX_OCCURRENCE
     }
   });
   ```

**Fibonacci Delays Table**:

| Occurrence | Delay (seconds) | Delay (hours) |
| ---------- | --------------- | ------------- |
| 1          | 1               | 0.0003        |
| 5          | 5               | 0.0014        |
| 10         | 55              | 0.015         |
| 15         | 610             | 0.17          |
| 19         | 4,181           | 1.16          |
| 25         | 75,025          | 20.84         |

---

### Task 4: Add a New Saga

**Scenario**: Create `refund_purchase` saga

**Steps**:

1. **Define Saga Title** (`saga/commence.ts:3`)

   ```typescript
   export const sagaTitle = {
     // ... existing sagas
     RefundPurchase: 'refund_purchase',
   } as const;
   ```

2. **Define Payload** (`saga/commence.ts:26`)

   ```typescript
   export interface SagaCommencePayload {
     // ... existing payloads
     ['refund_purchase']: {
       userId: string;
       purchaseId: string;
       amount: number;
       reason: string;
     };
   }
   ```

3. **Add Commands** (if new steps needed)

   ```typescript
   // In @types/saga/commands/coins.ts
   export const CoinsCommands = {
     // ... existing commands
     RefundCoins: 'refund_purchase:refund_coins',
   } as const;
   ```

4. **Implement Orchestrator** (in saga app)

   ```typescript
   const commenceEmitter = await commenceSagaListener('amqp://localhost');

   commenceEmitter.on('refund_purchase', async ({ channel, saga }) => {
     const { userId, purchaseId, amount } = saga.payload;

     const sagaId = generateSagaId();

     // Step 1: Refund coins
     await sendToQueue('coins_commands', {
       microservice: 'coins',
       command: 'refund_purchase:refund_coins',
       sagaId,
       status: 'pending',
       payload: { userId, amount },
       previousPayload: {},
       isCurrentStep: true,
     });

     channel.ackMessage();
   });

   // Listen for step completion
   const stepEmitter = await startGlobalSagaStepListener('amqp://localhost');

   stepEmitter.on('refund_purchase:refund_coins', async ({ channel, step }) => {
     if (step.status === 'success') {
       console.log('Refund completed:', step.sagaId);
       channel.ackMessage();
     } else {
       console.error('Refund failed:', step.sagaId);
       channel.nackWithFibonacciStrategy();
     }
   });
   ```

5. **Implement Step Handler** (in coins microservice)

   ```typescript
   const commandEmitter = await connectToSagaCommandEmitter({
     url: 'amqp://localhost',
     microservice: 'coins',
     events: [],
   });

   commandEmitter.on('refund_purchase:refund_coins', async ({ channel, sagaId, payload }) => {
     try {
       await refundCoinsToUser(payload.userId, payload.amount);
       channel.ackMessage({ refunded: true, timestamp: new Date() });
     } catch (error) {
       console.error('Refund failed:', error);
       channel.nackWithFibonacciStrategy();
     }
   });
   ```

6. **Commence Saga** (from client)

   ```typescript
   import { commenceSaga } from 'legend-transactional';

   await commenceSaga('refund_purchase', {
     userId: 'user_123',
     purchaseId: 'purchase_456',
     amount: 100,
     reason: 'Customer request',
   });
   ```

---

### Task 5: Debug a Failed Message

**Scenario**: Message keeps failing and requeueing

**Steps**:

1. **Check RabbitMQ Management UI**
   - Navigate to `http://localhost:15672`
   - Look for queue with `_requeue` suffix
   - Check message headers: `x-retry-count`, `x-occurrence`

2. **Add Logging to Consumer**

   ```typescript
   emitter.on('problematic.event', async ({ channel, payload }) => {
     console.log('Received event:', payload);
     console.log('Retry count:', channel['msg'].properties.headers?.['x-retry-count']);

     try {
       await processEvent(payload);
       channel.ackMessage();
     } catch (error) {
       console.error('Processing failed:', error);
       const { count, delay } = channel.nackWithDelay(5000, 5);
       console.log(`NACK #${count}, next retry in ${delay}ms`);
     }
   });
   ```

3. **Check Max Retries Configuration**

   ```typescript
   // Option 1: Fixed delay with max retries
   channel.nackWithDelay(2000, 10); // 10 retries max

   // Option 2: Fibonacci with max retries
   channel.nackWithFibonacciStrategy(19, 20); // 20 retries max
   ```

4. **Dead Letter Handling** (if max retries exceeded)
   - Message is NACKed without requeue
   - Implement dead letter queue in RabbitMQ config:
     ```typescript
     await channel.assertQueue('my_queue', {
       durable: true,
       arguments: {
         'x-dead-letter-exchange': 'dead_letter_exchange',
       },
     });
     ```

---

## 🐛 Debugging Guide

### Common Issues

#### 1. **Connection Refused to RabbitMQ**

**Error**: `ECONNREFUSED`

**Causes**:

- RabbitMQ not running
- Wrong connection URL

**Solution**:

```bash
# Check RabbitMQ status
sudo systemctl status rabbitmq-server

# Start RabbitMQ
sudo systemctl start rabbitmq-server

# Verify connection URL
echo $RABBIT_URI
# Should be: amqp://user:password@host:port
```

#### 2. **Message Not Being Consumed**

**Symptoms**:

- Queue filling up in RabbitMQ UI
- No logs in consumer

**Debugging**:

```typescript
// Check if consumer is registered
const channel = await getConsumeChannel();
console.log('Consumer tags:', channel.consumers);

// Verify queue binding
console.log('Queue bindings:', await channel.checkQueue('my_queue'));

// Test with wildcard listener
emitter.on('*', (event, data) => {
  console.log('Received event:', event, data);
});
```

#### 3. **Type Errors After Adding Event**

**Error**: `Type 'X' is not assignable to type 'MicroserviceEvent'`

**Cause**: Event not added to `microserviceEvent` constant

**Solution**:

```typescript
// @types/event/events.ts

// 1. Add to interface
export interface EventPayload {
  'my.new_event': { data: string };
}

// 2. Add to constant (THIS IS REQUIRED!)
export const microserviceEvent = {
  'MY.NEW_EVENT': 'my.new_event', // ← Don't forget this!
} as const;
```

#### 4. **Saga Step Not Executing**

**Symptoms**:

- Saga commenced but steps never trigger
- No errors in logs

**Debugging**:

```typescript
// In saga orchestrator
commenceEmitter.on('*', (title, { saga }) => {
  console.log('Saga commenced:', title, saga);
});

stepEmitter.on('*', (command, { step }) => {
  console.log('Step received:', command, step);
});

// Check queue names match
console.log('Expected queue:', getQueueConsumer('myservice'));

// Verify exchange/queue bindings in RabbitMQ UI
```

#### 5. **Message ACKed but Still Requeuing**

**Cause**: Calling `ackMessage()` after async operation that throws

**Wrong**:

```typescript
emitter.on('event', async ({ channel, payload }) => {
  channel.ackMessage(); // ❌ ACK too early
  await mightFail(payload); // If this throws, message is lost
});
```

**Correct**:

```typescript
emitter.on('event', async ({ channel, payload }) => {
  try {
    await mightFail(payload);
    channel.ackMessage(); // ✅ ACK only after success
  } catch (error) {
    channel.nackWithDelay(2000, 5);
  }
});
```

### Debugging Tools

**1. RabbitMQ Management UI**

- URL: `http://localhost:15672` (default)
- Username/Password: `guest/guest` (default)
- Features:
  - View queues and message counts
  - Inspect message headers
  - Manually purge/move messages

**2. Console Logging**

```typescript
import { ConsumeMessage } from 'amqplib';

function debugMessage(msg: ConsumeMessage) {
  console.log('Message details:', {
    content: msg.content.toString(),
    headers: msg.properties.headers,
    exchange: msg.fields.exchange,
    routingKey: msg.fields.routingKey,
    redelivered: msg.fields.redelivered,
    retryCount: msg.properties.headers?.['x-retry-count'] ?? 0,
  });
}
```

**3. TypeScript Compiler**

```bash
# Check types without building
pnpm type-check

# Watch mode for instant feedback
cd packages/legend-transac
pnpm build:dev
```

**4. Turbo Cache Debugging**

```bash
# Clear turbo cache
rm -rf .turbo

# Force rebuild without cache
pnpm build --force
```

---

## 📝 Code Review Checklist

When adding features or reviewing PRs:

### Events

- [ ] Event payload defined in `EventPayload` interface
- [ ] Event constant added to `microserviceEvent`
- [ ] Event documented with TSDoc comment
- [ ] Event name follows `{service}.{action}` pattern
- [ ] Payload uses existing types where possible

### Saga Commands

- [ ] Command added to appropriate `{service}Commands` const
- [ ] Command follows `{saga_title}:{action}` naming
- [ ] Command mapped in `CommandMap` interface
- [ ] Payload type defined if not in existing types

### Microservices

- [ ] Microservice added to `availableMicroservices`
- [ ] Command file created in `@types/saga/commands/`
- [ ] Commands exported from `commands/index.ts`
- [ ] Queue consumer added to `getQueueConsumer` utility

### Code Quality

- [ ] No `any` types (use `unknown` instead)
- [ ] All functions have TSDoc comments
- [ ] Error handling includes logging
- [ ] ACK/NACK logic is correct (ACK only after success)
- [ ] Retry strategy is appropriate (Fibonacci for long-running)
- [ ] No hardcoded connection strings (use env vars)

### CI/CD Checks

- [ ] Build succeeds: `pnpm run build`
- [ ] Type check passes: `pnpm run type-check`
- [ ] Linting passes: `pnpm run lint`
- [ ] Formatting applied: `pnpm run format`
- [ ] Changeset added: `pnpm changeset`

---

## 🚀 Deployment

### Publishing to npm

**Note**: This is automated via GitHub Actions (`.github/workflows/release.yml`)

**Manual Process**:

1. **Create Changeset**

   ```bash
   pnpm changeset
   # Select package: legend-transactional
   # Select version bump: patch/minor/major
   # Enter description
   ```

2. **Version Packages**

   ```bash
   pnpm changeset version
   # Updates package.json and CHANGELOG.md
   ```

3. **Build & Publish**
   ```bash
   cd packages/legend-transac
   pnpm build
   npm publish --access public
   ```

**Automated Process** (recommended):

1. Merge PR with changeset to `main`
2. GitHub Action creates "Version Packages" PR
3. Merge "Version Packages" PR
4. GitHub Action publishes to npm automatically

### Versioning Strategy

**Follows Semantic Versioning (SemVer)**:

- **Patch** (2.2.3 → 2.2.4): Bug fixes, event additions
- **Minor** (2.2.3 → 2.3.0): New features, new microservices
- **Major** (2.2.3 → 3.0.0): Breaking changes (rare)

---

## 📚 Additional Resources

### Documentation

- **NPM Package**: https://www.npmjs.com/package/legend-transactional
- **GitHub Repo**: https://github.com/legendaryum-metaverse/legend-transactional
- **Changelog**: `packages/legend-transac/CHANGELOG.md`

### RabbitMQ

- **Official Docs**: https://www.rabbitmq.com/documentation.html
- **Headers Exchange**: https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchange-headers
- **Message TTL**: https://www.rabbitmq.com/ttl.html

### TypeScript

- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Utility Types**: https://www.typescriptlang.org/docs/handbook/utility-types.html

### Saga Pattern

- **Microservices.io**: https://microservices.io/patterns/data/saga.html
- **AWS Blog**: https://aws.amazon.com/blogs/compute/implementing-saga-pattern-with-aws-step-functions/

---

## 🎯 Success Criteria

After reading this document, you should be able to:

1. ✅ **Understand the architecture** in 10-15 minutes
2. ✅ **Add a new event** without assistance
3. ✅ **Add a new microservice** with minimal guidance
4. ✅ **Implement a saga** following the established patterns
5. ✅ **Debug common issues** using the debugging guide
6. ✅ **Review code** using the checklist
7. ✅ **Compare to Rust implementation** (if familiar with Rust version)

---

## 🔮 Future Enhancements

Potential improvements (not yet implemented):

1. **Unit Tests for Core Library**
   - Currently only GitHub action has tests
   - Add Jest tests for `Broker`, `Consumer`, `Connections`

2. **Dead Letter Queue Handling**
   - Automatic DLQ setup for failed messages
   - Admin UI for retrying DLQ messages

3. **Distributed Tracing**
   - OpenTelemetry integration
   - Saga execution visualization

4. **Schema Validation**
   - Runtime validation with Zod/Joi
   - Prevent invalid payloads at runtime

5. **Health Check Endpoint**
   - Expose RabbitMQ connection status
   - Queue depth monitoring

6. **Saga Compensation Logic**
   - Explicit compensation steps
   - Rollback on partial failure

---

**Generated for**: Claude Code
**Date**: 2025-10-05
**Library Version**: 2.2.3
