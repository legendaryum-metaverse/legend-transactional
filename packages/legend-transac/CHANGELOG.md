# legend-transactional

## 1.5.5

### Patch Changes

-   5c7012d: new event to duplicate minimal user data in the microservice that listens to it. this occurs when the user is created

## 1.5.4

### Patch Changes

-   ba5b0ce: Create social user step renamed

## 1.5.3

### Patch Changes

-   6071acc: Commands to create new user in a transaction manner

## 1.5.2

### Patch Changes

-   a9185aa: Rankings microservice added

## 1.5.1

### Patch Changes

-   1d7f33f: email is added to 'coins.send_email' event

## 1.5.0

### Minor Changes

-   b804faf: Change payment domain to coins

## 1.4.21

### Patch Changes

-   43f4471: Event to delete assets in batch

## 1.4.20

### Patch Changes

-   ae2fc9f: micro lengend-send-email added to available microservices list

    Event to set a send a new email to a user

## 1.4.19

### Patch Changes

-   b1e371e: micro social media rooms added to available microservices list

## 1.4.18

### Patch Changes

-   336cfa8: coins update subscription event

## 1.4.17

### Patch Changes

-   081dab3: delete step in auth command to update social user image

## 1.4.16

### Patch Changes

-   bf124d2: Delete social step from notify client through WS to update-refetch the social user image. Delete commence saga for this action, now is sync in client. Update image picture step in auth to delete the picture, is a base64.

## 1.4.15

### Patch Changes

-   27ff94a: Event to logout a user from all micros.

## 1.4.14

### Patch Changes

-   9465346: no actual content is changed, only testing the new turbo v2 and swc 0.4

## 1.4.13

### Patch Changes

-   eaa4eca: Event to set a mission in progress

## 1.4.12

### Patch Changes

-   b605c30: micro missions added to available microservices list

## 1.4.11

### Patch Changes

-   c1965b6: Delete update_island_room_template_commence_saga

## 1.4.10

### Patch Changes

-   83a51ee: event to give the user coins for completing a mission

## 1.4.9

### Patch Changes

-   3b26ae0: Added new saga update_island_room_template to update data from island rooms in room creators and showcase

## 1.4.8

### Patch Changes

-   d92e99c: update payload in room_inventory.update_vp_building_image event

## 1.4.7

### Patch Changes

-   162a3f6: new event auth.deleted_user to delete all related info

## 1.4.6

### Patch Changes

-   154ee03: - new event room_inventory.update_vp_building_image
    -   new event room_snapshot.building_change_in_island

## 1.4.5

### Patch Changes

-   60454ba: new event room_creator.created_room to create a new product virtual in showcase

## 1.4.4

### Patch Changes

-   18e5d5a: new event 'room_creator.update_user_room' to update user room

## 1.4.3

### Patch Changes

-   0dfc9d6: Delete commands and an event not longer used in the asset resource purchase flow

## 1.4.2

### Patch Changes

-   f19b678: new command 'SavePurchasedResource' in room-inventory and remove 'PurchaseResource' command in room-snapshot

## 1.4.1

### Patch Changes

-   7cc7f3b: Added new event room-snapshot.first_snapshot to to notify the first saved snapshot of a room.

## 1.4.0

### Minor Changes

-   696dab0: Transactional service to handle saga orchestration

## 1.3.1

### Patch Changes

-   350f2fe: new event payments.cancel_pre_purchase_reservation

    new event payments.cancel_pre_purchase_reservation. this event is to cancel the pre-purchase reservation of a resource in room-inventory. when the Redis key in payments expires, it will be removed, and consequently, the pre-purchase reservation will be canceled

## 1.3.0

### Minor Changes

-   f698b7f: Healthcheck strategy modified

## 1.2.0

### Minor Changes

-   52294f0: - Init class to retrieve the emitters as methods, each one can prepare the connection.
    -   Cleaning resources that are not used anymore.

## 1.1.7

### Patch Changes

-   3d3272f: Removing unitId from purchase_resource_flow

## 1.1.6

### Patch Changes

-   81e1202: change the type of unityId has been changed from string to number

## 1.1.5

### Patch Changes

-   23a63a1: new field in purchase_resource_flow payload. this will serve to store the unityId in room-snapshot, a microservice responsible for managing the resources owned by a user

## 1.1.4

### Patch Changes

-   7142ff7: Fix events blockChat and unblockChat to handle chats in rapid-messaging

## 1.1.3

### Patch Changes

-   4ce4c09: Added new events blockChat and unblockChat to handle chats in rapid-messaging

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
