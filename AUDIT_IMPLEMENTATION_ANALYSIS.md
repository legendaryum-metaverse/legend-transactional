# Audit Feature Implementation Analysis

## Rust → TypeScript Migration Guide

**Date**: 2025-10-05
**Source**: Rust library @ `/home/jorge/Documents/LEGENDARYUM/metaverse-rust-library/rust-library/legend-saga/src/`
**Target**: TypeScript library @ `/home/jorge/Documents/LEGENDARYUM/metaverse-lib/legend-transactional/`

---

## 1. Event Definitions

### Rust Implementation (`events.rs`)

**Location**: `events.rs:14-22`

```rust
#[derive(Debug, Clone, Copy, AsRefStr, EnumString, PartialEq, EnumIter, Hash, Eq)]
#[strum(serialize_all = "snake_case")]
pub enum MicroserviceEvent {
    #[strum(serialize = "audit.received")]
    AuditReceived,
    #[strum(serialize = "audit.processed")]
    AuditProcessed,
    #[strum(serialize = "audit.dead_letter")]
    AuditDeadLetter,
    // ... other events
}
```

**Payload Structures**:

```rust
// events.rs:655-667
pub struct AuditReceivedPayload {
    pub microservice: String,
    pub received_event: String,
    pub received_at: u64,          // UNIX timestamp
    pub queue_name: String,
    pub event_id: Option<String>,
}

// events.rs:676-688
pub struct AuditProcessedPayload {
    pub microservice: String,
    pub processed_event: String,
    pub processed_at: u64,         // UNIX timestamp
    pub queue_name: String,
    pub event_id: Option<String>,
}

// events.rs:697-713
pub struct AuditDeadLetterPayload {
    pub microservice: String,
    pub rejected_event: String,
    pub rejected_at: u64,          // UNIX timestamp
    pub queue_name: String,
    pub rejection_reason: String,  // "delay" | "fibonacci_strategy"
    pub retry_count: Option<u32>,
    pub event_id: Option<String>,
}
```

### TypeScript Mapping

**Target File**: `packages/legend-transac/src/@types/event/events.ts`

```typescript
// Add to microserviceEvent constant
export const microserviceEvent = {
  // ... existing events
  'AUDIT.RECEIVED': 'audit.received',
  'AUDIT.PROCESSED': 'audit.processed',
  'AUDIT.DEAD_LETTER': 'audit.dead_letter',
} as const;

// Add to EventPayload interface
export interface EventPayload {
  // ... existing events
  'audit.received': {
    microservice: string;
    receivedEvent: string; // camelCase per TS convention
    receivedAt: number; // UNIX timestamp in seconds
    queueName: string;
    eventId?: string;
  };
  'audit.processed': {
    microservice: string;
    processedEvent: string;
    processedAt: number;
    queueName: string;
    eventId?: string;
  };
  'audit.dead_letter': {
    microservice: string;
    rejectedEvent: string;
    rejectedAt: number;
    queueName: string;
    rejectionReason: string;
    retryCount?: number;
    eventId?: string;
  };
}
```

---

## 2. Infrastructure Setup

### Rust Implementation (`consumers.rs:311-397`)

**Key Points**:

- Uses **Direct Exchange** (not Headers Exchange)
- Exchange name: `"audit_exchange"`
- 3 separate durable queues
- Each queue bound with routing key = event name

```rust
pub(crate) async fn create_audit_logging_resources(&self) -> Result<(), lapin::Error> {
    let channel = self.events_channel.lock().await;

    // Create direct exchange for audit events
    channel.exchange_declare(
        Exchange::AUDIT,              // "audit_exchange"
        ExchangeKind::Direct,
        ExchangeDeclareOptions {
            durable: true,
            ..Default::default()
        },
        FieldTable::default(),
    ).await?;

    // Create 3 separate queues
    channel.queue_declare(Queue::AUDIT_RECEIVED_COMMANDS, ...).await?;
    channel.queue_declare(Queue::AUDIT_PROCESSED_COMMANDS, ...).await?;
    channel.queue_declare(Queue::AUDIT_DEAD_LETTER_COMMANDS, ...).await?;

    // Bind each queue to its routing key
    channel.queue_bind(Queue::AUDIT_RECEIVED_COMMANDS, Exchange::AUDIT, "audit.received", ...).await?;
    channel.queue_bind(Queue::AUDIT_PROCESSED_COMMANDS, Exchange::AUDIT, "audit.processed", ...).await?;
    channel.queue_bind(Queue::AUDIT_DEAD_LETTER_COMMANDS, Exchange::AUDIT, "audit.dead_letter", ...).await?;

    Ok(())
}
```

**Constants** (`queue_consumer_props.rs:9-14, 29-30`):

```rust
pub struct Queue;
impl Queue {
    pub const AUDIT_RECEIVED_COMMANDS: &'static str = "audit_received_commands";
    pub const AUDIT_PROCESSED_COMMANDS: &'static str = "audit_processed_commands";
    pub const AUDIT_DEAD_LETTER_COMMANDS: &'static str = "audit_dead_letter_commands";
}

pub struct Exchange;
impl Exchange {
    pub const AUDIT: &'static str = "audit_exchange";
}
```

### TypeScript Mapping

**Target File**: `packages/legend-transac/src/constants.ts`

```typescript
export const exchange = {
  // ... existing exchanges
  Audit: 'audit_exchange',
} as const;

export const auditQueues = {
  AuditReceived: 'audit_received_commands',
  AuditProcessed: 'audit_processed_commands',
  AuditDeadLetter: 'audit_dead_letter_commands',
} as const;
```

**Infrastructure Method** - Add to appropriate file (likely in `Connections/` or new `Audit/` directory):

```typescript
async function createAuditLoggingResources(channel: Channel): Promise<void> {
  // Declare audit exchange
  await channel.assertExchange(exchange.Audit, 'direct', {
    durable: true,
  });

  // Declare queues
  await channel.assertQueue(auditQueues.AuditReceived, { durable: true });
  await channel.assertQueue(auditQueues.AuditProcessed, { durable: true });
  await channel.assertQueue(auditQueues.AuditDeadLetter, { durable: true });

  // Bind queues to exchange with routing keys
  await channel.bindQueue(auditQueues.AuditReceived, exchange.Audit, 'audit.received');
  await channel.bindQueue(auditQueues.AuditProcessed, exchange.Audit, 'audit.processed');
  await channel.bindQueue(auditQueues.AuditDeadLetter, exchange.Audit, 'audit.dead_letter');
}
```

---

## 3. Automatic Audit Emission

### Rust Implementation (`events_consume.rs`)

**Three Emission Points**:

#### 3.1 `audit.received` - On Event Reception (Line 196-213)

```rust
async fn handle_event(
    &self,
    delivery: &lapin::message::Delivery,
    emitter: &Emitter<EventHandler, MicroserviceEvent>,
    queue_name: &str,
) -> Result<(), RabbitMQError> {
    let payload: HashMap<String, Value> = serde_json::from_slice(&delivery.data)?;
    let event_key = Self::find_event_values(&delivery.properties.headers()...)?;
    let event = &event_key[0];

    // CRITICAL: Emit audit.received BEFORE processing
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let audit_received_payload = AuditReceivedPayload {
        microservice: self.microservice.as_ref().to_string(),
        received_event: event.as_ref().to_string(),
        received_at: timestamp,
        queue_name: queue_name.to_string(),
        event_id: None,
    };

    // Emit the audit.received event (don't fail the main flow if audit fails)
    if let Err(e) = RabbitMQClient::publish_audit_received_event(audit_received_payload).await {
        error!("Failed to emit audit.received event: {:?}", e);
    }

    // Now create handler and emit to user code
    let event_handler = EventHandler { ... };
    emitter.emit(*event, event_handler).await;
    Ok(())
}
```

#### 3.2 `audit.processed` - On Successful ACK (Line 41-67)

```rust
impl EventHandler {
    pub async fn ack(&self) -> Result<(), RabbitMQError> {
        // First, ack the original message
        self.channel.ack().await?;

        // Then emit audit.processed event automatically
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let audit_payload = AuditProcessedPayload {
            microservice: self.microservice.clone(),
            processed_event: self.processed_event.clone(),
            processed_at: timestamp,
            queue_name: self.channel.queue_name.clone(),
            event_id: None,
        };

        // Emit the audit event using the new direct exchange method
        if let Err(e) = RabbitMQClient::publish_audit_event(audit_payload).await {
            // Log the error but don't fail the ack operation
            error!("Failed to emit audit.processed event: {:?}", e);
        }

        Ok(())
    }
}
```

#### 3.3 `audit.dead_letter` - On NACK (Line 69-97, 100-133)

```rust
impl EventHandler {
    pub async fn nack_with_delay(
        &self,
        delay: Duration,
        max_retries: i32,
    ) -> Result<(i32, Duration), RabbitMQError> {
        let result = self.channel.nack.with_delay(delay, max_retries).await?;

        // Emit audit.dead_letter event automatically
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let audit_payload = AuditDeadLetterPayload {
            microservice: self.microservice.clone(),
            rejected_event: self.processed_event.clone(),
            rejected_at: timestamp,
            queue_name: self.channel.queue_name.clone(),
            rejection_reason: "delay".to_string(),
            retry_count: Some(result.0 as u32),
            event_id: None,
        };

        // Emit the audit event (don't fail if audit fails)
        if let Err(e) = RabbitMQClient::publish_audit_dead_letter_event(audit_payload).await {
            error!("Failed to emit audit.dead_letter event: {:?}", e);
        }

        Ok(result)
    }

    // Similar for nack_with_fibonacci_strategy (line 100-134)
}
```

### TypeScript Mapping

**Key Insights**:

1. **Timing**: `audit.received` emitted BEFORE handler execution, `audit.processed`/`audit.dead_letter` AFTER
2. **Error Handling**: Audit failures NEVER fail the main flow - always log and continue
3. **Timestamps**: Use `Math.floor(Date.now() / 1000)` for UNIX seconds (not milliseconds!)
4. **Automatic**: No manual user intervention - library handles everything

**Target Files**:

- Event reception: `packages/legend-transac/src/Consumer/callbacks/event.ts`
- ACK method: `packages/legend-transac/src/Consumer/channels/Events.ts` (or similar)
- NACK methods: `packages/legend-transac/src/Consumer/channels/Consume.ts`

---

## 4. Non-Recursive Handler

### Rust Implementation (`events_consume.rs:389-441`)

**The Critical Pattern**:

```rust
/// AuditHandler - specialized handler for audit events that doesn't emit recursive audits
/// This prevents the audit microservice from auditing its own audit processing
#[derive(Clone)]
pub struct AuditHandler {
    payload: HashMap<String, Value>,
    channel: EventsConsumeChannel,
}

impl AuditHandler {
    // ... payload parsing methods same as EventHandler

    /// Audit-specific ack that doesn't emit recursive audit events
    pub async fn audit_ack(&self) -> Result<(), RabbitMQError> {
        self.channel.ack().await
    }

    /// Standard ack method - doesn't emit recursive audit events for AuditHandler
    pub async fn ack(&self) -> Result<(), RabbitMQError> {
        self.channel.ack().await
    }

    /// Nack with delay - no audit emission for audit handler
    pub async fn nack_with_delay(
        &self,
        delay: Duration,
        max_retries: i32,
    ) -> Result<(i32, Duration), RabbitMQError> {
        self.channel.nack.with_delay(delay, max_retries).await
    }

    /// Nack with fibonacci strategy - no audit emission for audit handler
    pub async fn nack_with_fibonacci_strategy(
        &self,
        max_occurrence: i32,
        max_retries: i32,
    ) -> Result<(i32, Duration, i32), RabbitMQError> {
        self.channel
            .nack
            .with_fibonacci_strategy(max_occurrence, max_retries)
            .await
    }
}
```

**Comparison**:

| Method                           | `EventHandler`               | `AuditHandler`       |
| -------------------------------- | ---------------------------- | -------------------- |
| `ack()`                          | ✅ Emits `audit.processed`   | ❌ No audit emission |
| `nack_with_delay()`              | ✅ Emits `audit.dead_letter` | ❌ No audit emission |
| `nack_with_fibonacci_strategy()` | ✅ Emits `audit.dead_letter` | ❌ No audit emission |
| Reception                        | ✅ Emits `audit.received`    | ❌ No audit emission |

**Audit Event Consumption** (`events_consume.rs:355-386`):

```rust
async fn handle_audit_event(
    &self,
    delivery: &lapin::message::Delivery,
    emitter: &Emitter<AuditHandler, MicroserviceEvent>,
    queue_name: &str,
) -> Result<(), RabbitMQError> {
    let payload: HashMap<String, Value> = serde_json::from_slice(&delivery.data)?;

    // For audit events, we determine the event type from queue name
    let event = match queue_name {
        Queue::AUDIT_RECEIVED_COMMANDS => MicroserviceEvent::AuditReceived,
        Queue::AUDIT_PROCESSED_COMMANDS => MicroserviceEvent::AuditProcessed,
        Queue::AUDIT_DEAD_LETTER_COMMANDS => MicroserviceEvent::AuditDeadLetter,
        _ => return Err(RabbitMQError::InvalidHeader),
    };

    let channel = self.events_channel.lock().await;
    let delivery = MyDelivery::new(delivery);
    let response_channel = EventsConsumeChannel::new(channel.clone(), delivery, queue_name.to_string());

    // NOTE: NO audit.received emission here!
    let audit_handler = AuditHandler {
        payload,
        channel: response_channel,
    };

    emitter.emit(event, audit_handler).await;
    Ok(())
}
```

### TypeScript Mapping

**Target**: Create new handler class or modify existing channel classes

**Key Requirements**:

1. Create separate `AuditConsumeChannel` class (or similar) that does NOT emit audit events
2. Ensure `ackMessage()` and `nack*()` methods skip audit emission
3. Use separate consumption path for audit events (different callback)
4. NO `audit.received` emission when processing audit events

---

## 5. Publishing Methods

### Rust Implementation (`publish_event.rs:55-109`)

```rust
/// Publishes audit events to the direct audit exchange
/// Uses the event type as routing key for flexible audit event routing
pub async fn publish_audit_event<T: PayloadEvent + Serialize>(
    payload: T,
) -> Result<(), RabbitMQError> {
    let channel_arc = get_or_init_publish_channel().await?;
    let channel = channel_arc.lock().await;

    // Declare audit exchange if it doesn't exist
    channel
        .exchange_declare(
            Exchange::AUDIT,
            ExchangeKind::Direct,
            ExchangeDeclareOptions {
                durable: true,
                ..Default::default()
            },
            FieldTable::default(),
        )
        .await?;

    // Use the event type as routing key for flexible audit event routing
    let event_type = payload.event_type();
    let routing_key = event_type.as_ref(); // "audit.received", "audit.processed", or "audit.dead_letter"

    let body = serde_json::to_vec(&payload)?;

    channel
        .basic_publish(
            Exchange::AUDIT,
            routing_key, // Routes to appropriate queue based on event type
            BasicPublishOptions::default(),
            &body,
            BasicProperties::default()
                .with_content_type("application/json".into())
                .with_delivery_mode(2), // persistent
        )
        .await?;

    Ok(())
}

/// Convenience wrappers
pub async fn publish_audit_received_event<T: PayloadEvent + Serialize>(
    payload: T,
) -> Result<(), RabbitMQError> {
    Self::publish_audit_event(payload).await
}

pub async fn publish_audit_dead_letter_event<T: PayloadEvent + Serialize>(
    payload: T,
) -> Result<(), RabbitMQError> {
    Self::publish_audit_event(payload).await
}
```

### TypeScript Mapping

**Target File**: `packages/legend-transac/src/Broker/PublishToExchange.ts` or new `PublishAuditEvent.ts`

```typescript
import { Channel } from 'amqplib';
import { exchange } from '../constants';

async function publishAuditEvent<T extends keyof EventPayload>(
  channel: Channel,
  eventType: T,
  payload: EventPayload[T],
): Promise<void> {
  // Declare audit exchange (idempotent)
  await channel.assertExchange(exchange.Audit, 'direct', {
    durable: true,
  });

  // Use event type as routing key
  const routingKey = eventType; // 'audit.received' | 'audit.processed' | 'audit.dead_letter'

  const messageBuffer = Buffer.from(JSON.stringify(payload));

  await channel.publish(exchange.Audit, routingKey, messageBuffer, {
    contentType: 'application/json',
    deliveryMode: 2, // persistent
  });
}

// Convenience wrappers
export async function publishAuditReceived(channel: Channel, payload: EventPayload['audit.received']): Promise<void> {
  await publishAuditEvent(channel, 'audit.received', payload);
}

export async function publishAuditProcessed(channel: Channel, payload: EventPayload['audit.processed']): Promise<void> {
  await publishAuditEvent(channel, 'audit.processed', payload);
}

export async function publishAuditDeadLetter(
  channel: Channel,
  payload: EventPayload['audit.dead_letter'],
): Promise<void> {
  await publishAuditEvent(channel, 'audit.dead_letter', payload);
}
```

---

## 6. Connection Management

### Rust Implementation (`connection.rs`, `start.rs`)

**Microservice Addition** (`connection.rs:34`):

```rust
#[derive(Debug, Clone, PartialEq, Eq, EnumString, AsRefStr, EnumIter, Serialize, Deserialize)]
#[strum(serialize_all = "kebab-case")]
#[serde(rename_all = "kebab-case")]
pub enum AvailableMicroservices {
    // ... existing microservices
    AuditEda,
}
```

**Client Structure** (`connection.rs:83`):

```rust
pub struct RabbitMQClient {
    pub(crate) events_channel: Arc<Mutex<Channel>>,
    pub(crate) saga_channel: Arc<Mutex<Channel>>,
    pub(crate) events: &'static [MicroserviceEvent],
    pub(crate) microservice: AvailableMicroservices,
    // ...
    pub(crate) event_emitter:  Arc<Mutex<Option<EventEmitter>>>,
    pub(crate) saga_emitter: Arc<Mutex<Option<SagaEmitter>>>,
    pub(crate) audit_emitter: Arc<Mutex<Option<AuditEmitter>>>,  // <-- NEW
    // ...
}
```

**Audit Connection Method** (`start.rs:83-92`):

```rust
/// Connect to audit events - for audit-eda-micro only
/// Uses direct exchange routing for efficient single-consumer delivery
pub async fn connect_to_audit(&self) -> Result<AuditEmitter, RabbitMQError> {
    // Create audit queue and exchange infrastructure
    self.create_audit_logging_resources().await?;

    let emitter = self.start_consuming_audit().await;

    Ok(emitter)
}
```

**Audit Consumer Spawning** (`start.rs:94-135`):

```rust
pub(crate) async fn start_consuming_audit(&self) -> AuditEmitter {
    let mut emitter_guard = self.audit_emitter.lock().await;
    let emitter = emitter_guard.get_or_insert_with(Emitter::new).clone();

    // Spawn consumer for audit.received events
    tokio::spawn({
        let client = self.clone();
        let emitter = emitter.clone();
        async move {
            if let Err(e) = client.consume_audit_received_events(emitter).await {
                error!("Error consuming audit.received events: {:?}", e);
            }
        }
    });

    // Spawn consumer for audit.processed events
    tokio::spawn({
        let client = self.clone();
        let emitter = emitter.clone();
        async move {
            if let Err(e) = client.consume_audit_processed_events(emitter).await {
                error!("Error consuming audit.processed events: {:?}", e);
            }
        }
    });

    // Spawn consumer for audit.dead_letter events
    tokio::spawn({
        let client = self.clone();
        let emitter = emitter.clone();
        async move {
            if let Err(e) = client.consume_audit_dead_letter_events(emitter).await {
                error!("Error consuming audit.dead_letter events: {:?}", e);
            }
        }
    });

    emitter
}
```

**Automatic Infrastructure Creation** (`start.rs:20-22`):

```rust
pub async fn connect_to_events(&self) -> Result<EventEmitter, RabbitMQError> {
    let queue_name = self.events_queue_name.clone();
    self.create_header_consumers(&queue_name, self.events).await?;

    // Create audit logging resources, this feature is related only to "events", that is why we
    // create it here
    self.create_audit_logging_resources().await?;  // <-- AUTOMATIC

    let emitter = self.start_consuming_events().await;
    Ok(emitter)
}
```

### TypeScript Mapping

**Target Files**:

- `packages/legend-transac/src/@types/microservices.ts` - Add `AuditEda` microservice
- `packages/legend-transac/src/Connections/start.ts` - Add audit connection methods
- Integration into existing `connectToEvents()` method

**Key Requirements**:

1. Add `'audit-eda': 'audit-eda'` to `availableMicroservices`
2. Create `connectToAuditEvents()` method
3. Automatically call audit infrastructure setup in `connectToEvents()`
4. Return separate emitter for audit events

---

## 7. Rust-to-TypeScript Pattern Mapping

| **Rust Pattern**                                         | **TypeScript Equivalent**                                                                                                     | **Notes**                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `enum MicroserviceEvent`                                 | `const microserviceEvent = {...} as const; type MicroserviceEvent = typeof microserviceEvent[keyof typeof microserviceEvent]` | Already established in TS lib      |
| `Arc<Mutex<T>>`                                          | Single-threaded async, no need for Arc/Mutex                                                                                  | Node.js is single-threaded         |
| `async fn` + `await`                                     | `async function` + `await`                                                                                                    | Direct mapping                     |
| `Result<T, RabbitMQError>`                               | `Promise<T>` with `try/catch`                                                                                                 | Error handling via exceptions      |
| Trait `PayloadEvent`                                     | Interface `EventPayload` mapping                                                                                              | Already exists                     |
| `lapin` crate                                            | `amqplib` package                                                                                                             | Already in use                     |
| `tokio::spawn`                                           | No equivalent needed                                                                                                          | Single-threaded event loop         |
| `SystemTime::now().duration_since(UNIX_EPOCH).as_secs()` | `Math.floor(Date.now() / 1000)`                                                                                               | **Critical**: seconds, not ms!     |
| `Option<T>`                                              | `T \| undefined` or `T?`                                                                                                      | TypeScript optionals               |
| `u64`                                                    | `number`                                                                                                                      | JavaScript number precision limits |
| `#[derive(Clone)]`                                       | No equivalent needed                                                                                                          | JavaScript objects are references  |
| `&'static str`                                           | `const string`                                                                                                                | Compile-time constants             |
| `if let Err(e) = ...`                                    | `try { ... } catch (e) { ... }`                                                                                               | Error logging pattern              |

---

## 8. Critical Implementation Notes

### 8.1 Timestamp Precision

**⚠️ CRITICAL**: Rust uses UNIX seconds, not milliseconds!

```typescript
// WRONG
const timestamp = Date.now(); // milliseconds

// CORRECT
const timestamp = Math.floor(Date.now() / 1000); // seconds
```

### 8.2 Error Handling Philosophy

**Never fail the main flow due to audit errors**:

```typescript
try {
  await publishAuditEvent(...);
} catch (error) {
  console.error('Failed to emit audit event:', error);
  // Continue execution - don't throw!
}
```

### 8.3 Non-Recursion Strategy

**Key Principle**: Different code paths for regular vs. audit events

```
Regular Event Flow:
  receive → emit audit.received → handle → ack → emit audit.processed

Audit Event Flow:
  receive → handle → ack (NO AUDIT EMISSION)
```

### 8.4 Exchange Strategy

**Why Direct Exchange?**

- Single consumer (audit microservice only)
- Efficient routing (no pattern matching needed)
- Clear routing keys
- Different from headers exchange used for regular events

### 8.5 Queue Naming

Rust uses specific naming convention:

- `audit_received_commands`
- `audit_processed_commands`
- `audit_dead_letter_commands`

**Maintain exact names for cross-library compatibility!**

---

## 9. Implementation Checklist

### Phase 1: Type Definitions

- [ ] Add 3 audit events to `microserviceEvent` constant
- [ ] Add 3 audit payload types to `EventPayload` interface
- [ ] Add audit queue constants
- [ ] Add audit exchange constant
- [ ] Add `AuditEda` to `availableMicroservices`

### Phase 2: Infrastructure

- [ ] Create `createAuditLoggingResources()` function
- [ ] Integrate infrastructure setup into `connectToEvents()`
- [ ] Verify exchange/queue creation with RabbitMQ management UI

### Phase 3: Publishing

- [ ] Create `publishAuditEvent()` generic function
- [ ] Create convenience wrappers (received/processed/dead_letter)
- [ ] Test publishing to audit exchange

### Phase 4: Automatic Emission

- [ ] Add `audit.received` emission to event reception callback
- [ ] Add `audit.processed` emission to ACK method
- [ ] Add `audit.dead_letter` emission to NACK methods (both delay and fibonacci)
- [ ] Ensure error handling never fails main flow

### Phase 5: Non-Recursive Handler

- [ ] Create `AuditConsumeChannel` class (no audit emission)
- [ ] Create `auditCallback` function (uses AuditConsumeChannel)
- [ ] Implement queue-based event type detection
- [ ] Ensure no audit emission on audit event processing

### Phase 6: Connection Management

- [ ] Create `connectToAuditEvents()` method
- [ ] Spawn 3 separate consumers (one per audit queue)
- [ ] Return emitter for audit event handlers
- [ ] Test audit event consumption

### Phase 7: Validation

- [ ] Run `pnpm type-check` - verify no TypeScript errors
- [ ] Run `pnpm lint` - verify code quality
- [ ] Run `pnpm format` - verify formatting
- [ ] Manual RabbitMQ UI verification:
  - Audit exchange exists (direct type)
  - 3 audit queues exist
  - Queue bindings correct
  - Messages route correctly
- [ ] Functional verification:
  - Publish test event → verify 2 audit events (received + processed)
  - Cause NACK → verify audit.dead_letter emitted
  - Process audit event → verify NO recursive audits
  - Multiple microservices → verify isolation

---

## 10. File Modification Summary

### Files to Create:

1. `packages/legend-transac/src/Broker/PublishAuditEvent.ts`
2. `packages/legend-transac/src/Consumer/callbacks/auditEvent.ts`
3. `packages/legend-transac/src/Consumer/channels/AuditConsume.ts`
4. `packages/legend-transac/src/Audit/infrastructure.ts` (optional - or integrate into existing files)

### Files to Modify:

1. `packages/legend-transac/src/@types/event/events.ts` - Add audit events and payloads
2. `packages/legend-transac/src/@types/microservices.ts` - Add `AuditEda` microservice
3. `packages/legend-transac/src/constants.ts` - Add audit exchange and queue constants
4. `packages/legend-transac/src/Consumer/callbacks/event.ts` - Add audit.received emission
5. `packages/legend-transac/src/Consumer/channels/Events.ts` (or similar) - Add audit.processed emission to ACK
6. `packages/legend-transac/src/Consumer/channels/Consume.ts` - Add audit.dead_letter emission to NACK methods
7. `packages/legend-transac/src/Connections/start.ts` - Add `connectToAuditEvents()` and integrate infrastructure
8. `packages/legend-transac/src/index.ts` - Export new audit methods

---

## 11. Success Criteria

### Functional Parity Verification

**Given**: A microservice using the TypeScript library
**When**: An event is published and successfully processed
**Then**: Exactly 2 audit events are emitted (`audit.received` + `audit.processed`)

**Given**: A microservice using the TypeScript library
**When**: An event processing fails and is NACKed
**Then**: Exactly 2 audit events are emitted (`audit.received` + `audit.dead_letter`)

**Given**: The audit microservice consuming audit events
**When**: It processes audit events
**Then**: NO recursive audit events are emitted

**Given**: Multiple microservices running simultaneously
**When**: Each processes events
**Then**: Audit events are correctly attributed to each microservice

**Given**: Audit emission fails (e.g., RabbitMQ down)
**When**: Processing continues
**Then**: Main event flow is NOT interrupted

### Code Quality Verification

- ✅ `pnpm type-check` passes with no errors
- ✅ `pnpm lint` passes with no errors
- ✅ `pnpm format` applied successfully
- ✅ All TypeScript types are properly defined
- ✅ No `any` types used
- ✅ Code follows existing library patterns
- ✅ Error handling is consistent

---

**End of Analysis Document**
