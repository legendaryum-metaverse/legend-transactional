---
'legend-transactional': major
---

### Enhanced RabbitMQ Microservice Communication

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
