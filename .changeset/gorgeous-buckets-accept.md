---
'legend-transactional': patch
---

Added new event payments.notify_client to communicate with the client via web socket in payments server.
This event will be repeated if the client is not connected to websocket
