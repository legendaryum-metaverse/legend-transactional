---
'legend-transactional': patch
---

new event payments.cancel_pre_purchase_reservation

new event payments.cancel_pre_purchase_reservation. this event is to cancel the pre-purchase reservation of a resource in room-inventory. when the Redis key in payments expires, it will be removed, and consequently, the pre-purchase reservation will be canceled
