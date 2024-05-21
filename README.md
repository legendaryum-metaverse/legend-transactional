# `legend-transactional`

<div style="text-align: center;">
  <br/>
  <br/>
<img src="https://raw.githubusercontent.com/legendaryum-metaverse/legend-transactional/main/.github/assets/legend.jpg" alt="legendaryum" style="width: 30%;"/>
</div>

<hr />

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/legendaryum-metaverse/legend-transactional/release.yml?branch=main)](https://github.com/legendaryum-metaverse/legend-transactional/tree/main/packages/legend-transac)
[![GitHub](https://img.shields.io/github/license/legendaryum-metaverse/legend-transactional)](https://github.com/legendaryum-metaverse/legend-transactional/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/legend-transactional)](https://www.npmjs.com/package/legend-transactional)
[![npm](https://img.shields.io/npm/dm/legend-transactional)](https://www.npmjs.com/package/legend-transactional)
[![Bundle Size](https://img.shields.io/bundlephobia/min/legend-transactional)](https://bundlephobia.com/result?p=legend-transactional)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/legend-transactional)](https://bundlephobia.com/result?p=legend-transactional)
[![npm type definitions](https://img.shields.io/npm/types/legend-transactional)](https://www.npmjs.com/package/legend-transactional)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/legendaryum-metaverse/legend-transactional)](https://github.com/legendaryum-metaverse/legend-transactional/pulse)
[![GitHub last commit](https://img.shields.io/github/last-commit/legendaryum-metaverse/legend-transactional)](https://github.com/legendaryum-metaverse/legend-transactional/commits/main)

[**legend-transactional**](https://www.npmjs.com/package/legend-transactional) is a Node.js/TypeScript library designed to streamline communication
between microservices using RabbitMQ. It enables easy implementation of event-driven architectures and saga patterns, while ensuring reliable message delivery.

## Features

**Core Communication:**

-   **Publish/Subscribe Messaging:** Exchange messages between microservices using a
    publish-subscribe pattern.
-   **Headers-Based Routing:** Leverage the power of RabbitMQ's headers exchange for flexible and dynamic routing of messages based on custom headers.
-   **Durable Exchanges and Queues:** Ensure message persistence and reliability with durable RabbitMQ components.

**Saga Management:**

<div style="text-align: center;">
<img src="https://raw.githubusercontent.com/legendaryum-metaverse/legend-transactional/main/.github/assets/saga.png" alt="legendaryum" style="width: 90%;"/>
</div>

-   **Saga Orchestration:** Coordinate complex, multi-step transactions across multiple microservices with saga orchestration.
-   **Saga Step Handlers:** Implement step-by-step saga logic in your microservices using callbacks.
-   **Compensation Logic:** Define compensating actions for saga steps to handle failures
    gracefully and maintain data consistency.

## Contributors

Thanks to [all contributors](https://github.com/legendaryum-metaverse/legend-transactional/graphs/contributors)!

## Author

Jorge Clavijo <https://github.com/jym272>

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
