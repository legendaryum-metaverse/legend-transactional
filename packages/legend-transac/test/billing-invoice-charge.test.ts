import {microserviceEvent} from '../src/@types/event/events';
import type {EventPayload} from '../src/@types/event/events';

describe('billing.invoice_charge_created', () => {
  it('is registered in the event map', () => {
    expect(microserviceEvent['BILLING.INVOICE_CHARGE_CREATED']).toBe('billing.invoice_charge_created');
  });

  it('carries the payload fields used on the wire', () => {
    const payload: EventPayload['billing.invoice_charge_created'] = {
      chargeId: 'c-1',
      userId: 'u-1',
      amount: 1500,
      currency: 'usd',
      metadata: {product_type: 'suggested_game', product_id: 'p-1'},
      occurredAt: '2026-10-13T00:00:00Z',
    };
    expect(Object.keys(payload).sort()).toEqual(['amount', 'chargeId', 'currency', 'metadata', 'occurredAt', 'userId']);
  });
});
