import {
  OPERATION_HEADER,
  currentOperation,
  operationFromHeaders,
  operationHeaders,
  operationMetadata,
  setMissingOperationHook,
  withOperation,
  withOperationFromMetadata,
} from '../src/operation';

afterEach(() => {
  setMissingOperationHook(undefined);
});

describe('withOperation', () => {
  it('binds the operation for anything running inside it', () => {
    const seen = withOperation('op-brasil', () => currentOperation());
    expect(seen).toBe('op-brasil');
  });

  // The scope has to end with the call. A leaked operation is worse than a
  // missing one: the next message published would carry the previous tenant.
  it('does not leak the operation outside its scope', () => {
    withOperation('op-brasil', () => currentOperation());
    expect(currentOperation()).toBeUndefined();
  });

  it('keeps the operation across an await', async () => {
    const seen = await withOperation('op-brasil', async () => {
      await Promise.resolve();
      return currentOperation();
    });
    expect(seen).toBe('op-brasil');
  });

  // A consumer handling a message with no operation must not inherit whatever
  // the previous one was bound to.
  it('an inner scope with no operation shadows the outer one', () => {
    const seen = withOperation('op-brasil', () => withOperation(undefined, () => currentOperation()));
    expect(seen).toBeUndefined();
  });
});

describe('operationFromHeaders', () => {
  it('reads a plain string header', () => {
    expect(operationFromHeaders({ [OPERATION_HEADER]: 'op-brasil' })).toBe('op-brasil');
  });

  // amqplib hands long strings back as Buffer depending on the broker encoding,
  // so a Buffer here is a normal message, not a corrupt one.
  it('reads a Buffer header', () => {
    expect(operationFromHeaders({ [OPERATION_HEADER]: Buffer.from('op-brasil') })).toBe('op-brasil');
  });

  it.each([
    ['no headers', undefined],
    ['null headers', null],
    ['empty object', {}],
    ['empty string', { [OPERATION_HEADER]: '' }],
    ['empty buffer', { [OPERATION_HEADER]: Buffer.from('') }],
    ['wrong type', { [OPERATION_HEADER]: 42 }],
  ])('returns undefined for %s', (_label, headers) => {
    expect(operationFromHeaders(headers as Record<string, unknown> | null | undefined)).toBeUndefined();
  });
});

describe('operationHeaders', () => {
  it('carries the bound operation', () => {
    const headers = withOperation('op-brasil', () => operationHeaders());
    expect(headers).toEqual({ [OPERATION_HEADER]: 'op-brasil' });
  });

  // Spreading an empty object leaves a published message byte-for-byte as it
  // was, which is what keeps un-migrated publishers working.
  it('is empty with no operation, so a publish is left untouched', () => {
    expect(operationHeaders()).toEqual({});
  });

  it('round-trips through operationFromHeaders', () => {
    const headers = withOperation('op-brasil', () => operationHeaders());
    expect(operationFromHeaders(headers)).toBe('op-brasil');
  });
});

describe('operationMetadata', () => {
  // Same key on both transports on purpose: one name for the tenant.
  it('uses the same key as the AMQP headers', () => {
    const metadata = withOperation('op-brasil', () => operationMetadata());
    expect(metadata).toEqual({ [OPERATION_HEADER]: 'op-brasil' });
  });
});

describe('withOperationFromMetadata', () => {
  it('binds the operation an incoming call carried', () => {
    const seen = withOperationFromMetadata(
      (key) => (key === OPERATION_HEADER ? 'op-brasil' : undefined),
      () => currentOperation(),
    );
    expect(seen).toBe('op-brasil');
  });

  it('binds nothing when the call carried no operation', () => {
    expect(
      withOperationFromMetadata(
        () => undefined,
        () => currentOperation(),
      ),
    ).toBeUndefined();
  });

  // An empty metadata value is absence, not an operation named "".
  it('treats an empty value as absent', () => {
    expect(
      withOperationFromMetadata(
        () => '',
        () => currentOperation(),
      ),
    ).toBeUndefined();
  });
});

describe('missing operation hook', () => {
  it('reports through the hook the services wire to their metrics', () => {
    const seen: [string, string][] = [];
    setMissingOperationHook((microservice, eventType) => seen.push([microservice, eventType]));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { reportMissingOperation } = require('../src/operation') as typeof import('../src/operation');
    reportMissingOperation('social', 'auth.deleted_user');

    expect(seen).toEqual([['social', 'auth.deleted_user']]);
  });

  it('is a no-op when nobody registered a hook, so the library needs no metrics backend', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { reportMissingOperation } = require('../src/operation') as typeof import('../src/operation');
    expect(() => reportMissingOperation('social', 'auth.deleted_user')).not.toThrow();
  });
});
