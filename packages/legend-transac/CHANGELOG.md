# legend-transac

## 1.0.9

### Patch Changes

-   66ff36c: mejores logs de error

## 1.0.8

### Patch Changes

-   ad93188: Se agrega isConnectionHealthy

## 1.0.7

### Patch Changes

-   179420b: Queue Healthy para health checks

## 1.0.6

### Patch Changes

-   a06393c: Nuevo saga persist_redsys

## 1.0.5

### Patch Changes

-   541eee9: Nuevos comandos pagos persitir redsys en db y blockchain

## 1.0.4

### Patch Changes

-   7b7cc00: Se agrega el comando products:send:email

## 1.0.3

### Patch Changes

-   10e2204: Payload for saga commence

## 1.0.2

### Patch Changes

-   4f79c30: types en startSaga

## 1.0.1

### Patch Changes

-   74836ca: Types en saga payload en el saga commencer

## 1.0.0

### Major Changes

-   c6416ba: Major realease

## 0.6.2

### Patch Changes

-   5870d0c: Se agrega el listener para escuchar saga

## 0.6.1

### Patch Changes

-   dcf8c24: Fix events admin cmds typo

## 0.6.0

### Minor Changes

-   41204da: Se agrega los microservicos de **events-admin** y **legend-analytics** junto con los comandos para comprar productos

## 0.5.3

### Patch Changes

-   ecbb50d: Se elimina el comando que obtiene el user blockchain y se renombra el comando que persiste la compra usando redsys

## 0.5.2

### Patch Changes

-   d0f033b: To prevent large delays, the maxOccurrence is used to reset the occurrence to 0 making the next
    delay reset to the first value of a fibonacci sequence: 1s.

## 0.5.1

### Patch Changes

-   726f5c4: Se añada "\_\_metadata" keys en el payload, este payload siempre será incluido en todo el saga incluso si no se pasa el payload al siguiente paso explícitamente.

## 0.5.0

### Minor Changes

-   c13aa12: Se cambia los nombres de los microservicios de test junto a sus comandos

## 0.4.2

### Patch Changes

-   668c7c8: Se agrega los comandos para recargar balance al usuario

## 0.4.1

### Patch Changes

-   1311ecb: Se mejora la estrategia de nacking, ahora se memoriza el hash de cada step, se puede agreagar sal al paso para diferenciarlo aun más.

## 0.4.0

### Minor Changes

-   b9a7c0e: Se diseña nacking sin limite de nackeo con delay siguiendo la serie de fiboncacci

## 0.3.0

### Minor Changes

-   f5f61ba: Comandos para poner y cancelar venta de nfts

## 0.2.0

### Minor Changes

-   49d522b: Se añade legend-integrations y pagosv2 a los microservicios disponible, se agregan comandos relacionados a la generacion de nfts

## 0.1.4

### Patch Changes

-   d84363d: se actualiza los comentarios

## 0.1.3

### Patch Changes

-   24ffe2b: pagsv2 y social micros

## 0.1.2

### Patch Changes

-   e6b6922: Se añade micro y comandos para "notificaciones" y "liptv"

## 0.1.1

### Patch Changes

-   4b75578: The payload is fixed for the next step in the microservices.

    The connection to the emitter is fixed, first create the `emitt` before consuming the messages.

## 0.1.0

### Minor Changes

-   8cfe3af: Se reemplaza

## 0.0.1

### Patch Changes

-   1a67f7f: first patch version
