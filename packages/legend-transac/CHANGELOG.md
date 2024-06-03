# legend-transactional

## 1.1.2

### Patch Changes

-   068f59d: a new saga step has been added in payments and a new microservice, room-inventory, has been added in AvailableMicroservices

## 1.1.1

### Patch Changes

-   4b6c9ee: Added new social command notify_client to communicate with the client via websocket in social server.
    This event will be repeated if the client is not connected to websocket

## 1.1.0

### Minor Changes

-   f4342d5: rename nackWithDelayAndRetries for nackWithDelay, Max Retries is optional, otherwise the nacking is forever.

## 1.0.7

### Patch Changes

-   5394777: Added new event payments.notify_client to communicate with the client via web socket in payments server.
    This event will be repeated if the client is not connected to websocket

## 1.0.6

### Patch Changes

-   198374e: export room-snapshot commands file. if this file is not exported, then the commands cannot be used when using the library. also, I also changed the order of importing RoomSnapshotCommands in commands.ts

## 1.0.5

### Patch Changes

-   6b6846d: update saga title: this title will be part of the asset purchase flow, both for deducting coins from a user and for giving them their asset once the transaction is completed. this flow will be used by the 'transactional' microservice and will pass through the 'payments' and 'room-snapshot' microservices

## 1.0.4

### Patch Changes

-   56d381a: new events for purchase resources flow

## 1.0.3

### Patch Changes

-   2d93996: - Fix the error of an export in a circular dependency context
    -   Improved build with **tsup**

## 1.0.2

### Patch Changes

-   df2049d: saga update_user:image, social.new_user event

## 1.0.1

### Patch Changes

-   5863da4: Fix: deploy

## 1.0.0

### Major Changes

-   6af26b1: ### Enhanced RabbitMQ Microservice Communication

    -   **Event-Driven Architecture**: Introduced a robust event-driven communication framework for
        microservices using RabbitMQ. This allows services to publish and subscribe to events, facilitating loosely coupled and scalable interactions.
    -   **Saga Orchestration**: Implemented saga pattern support for coordinating complex transactions
        across multiple microservices. The commenceSaga and startGlobalSagaStepListener functions enable reliable long-running workflows with compensation mechanisms.
    -   **Transactional Message Handling**: Added the startTransactional function to simplify the
        setup of
        microservices that need to both consume events and participate in sagas. This streamlines the connection, queue configuration, and event/command subscriptions.
    -   **Selective Event Consumption**: The connectToEvents function provides fine-grained control over
        which events a microservice subscribes to, reducing unnecessary message processing.
    -   **Robust Error Handling**: Implemented negative acknowledgment (NACK) mechanisms with
        configurable
        retry strategies (linear backoff and Fibonacci backoff) to handle failed message processing and ensure eventual consistency.
    -   **Optimized Requeuing**: Developed a sophisticated requeuing mechanism for failed messages that
        leverages custom headers and multiple exchanges to route messages specifically back to the microservice that encountered the error.

    ### Improved Code Quality and Maintainability

    -   **Detailed Documentation**: Added comprehensive TSDoc comments to all functions and classes,
        providing clear explanations, usage examples, and type information.
    -   **Type Safety**: Introduced generics to ensure type safety when working with different
        microservice
        events and payloads.
    -   **Refactored Code**: Refactored existing functions like eventCallback to improve code clarity,
        readability, and maintainability.
    -   **Code Comments**: Added inline comments to clarify the purpose of specific code blocks and
        configuration details.
    -   **Standardized Conventions**: Followed consistent coding conventions throughout the codebase for
        improved consistency and maintainability.

## 0.3.1

### Patch Changes

-   64a1bd5: Comandos para subir una imagen base64 de auth a storage y a social

## 0.3.0

### Minor Changes

-   411338f: It allows **commenceSaga** function connect with a specific uri.

## 0.2.0

### Minor Changes

-   ccdd75e: Deprecated events removed, new event added in saga, change from 'pagosv2' to 'payments'

## 0.1.1

### Patch Changes

-   54e3d95: Removing create social user in commence saga, now in api rest

## 0.1.0

### Minor Changes

-   d0e3634: Crate new user transaction: commands and new microservices: auth room-creator showcase

## 0.0.6

### Patch Changes

-   585a480: checking build

## 0.0.5

### Patch Changes

-   5c9dd1c: Se elimina report video y el micro de liptv que no se estaba usando

## 0.0.4

### Patch Changes

-   5ae462b: Se agrega commence saga y los steps para enviar token de recuperación de password

## 0.0.3

### Patch Changes

-   0d17ea4: Testeando la action

## 0.0.2

### Patch Changes

-   91520b9: Comandos para comprar imagen,room asset

## 0.0.1

### Patch Changes

-   4e60e5b: nuevo nombre de la librería
