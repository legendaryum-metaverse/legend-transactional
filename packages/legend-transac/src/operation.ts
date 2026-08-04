import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * The AMQP header carrying the SIPLEI operation identifier.
 * The same key is used for gRPC metadata so there is a single name across transports.
 */
export const OPERATION_HEADER = 'x-operation-id';

const storage = new AsyncLocalStorage<string | undefined>();

type MissingOperationHook = (microservice: string, eventType: string) => void;

let missingOperationHook: MissingOperationHook | undefined;

/**
 * Registers the callback invoked when a consumed message carries no operation.
 * A hook keeps the library free of a metrics backend; services wire it to
 * `events_without_operation_total`.
 */
export const setMissingOperationHook = (hook?: MissingOperationHook) => {
  missingOperationHook = hook;
};

export const reportMissingOperation = (microservice: string, eventType: string) => {
  missingOperationHook?.(microservice, eventType);
};

/**
 * Runs `fn` with `operationId` bound to the async context, so anything it
 * publishes propagates the operation without explicit plumbing.
 */
export const withOperation = <R>(operationId: string | undefined, fn: () => R): R => storage.run(operationId, fn);

/** Returns the operation bound to the current async context, if any. */
export const currentOperation = (): string | undefined => storage.getStore();

export const operationFromHeaders = (headers?: Record<string, unknown> | null): string | undefined => {
  const value = headers?.[OPERATION_HEADER];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  // amqplib surfaces long strings as Buffer depending on the broker encoding.
  if (Buffer.isBuffer(value)) {
    const decoded = value.toString('utf8');
    return decoded.length > 0 ? decoded : undefined;
  }
  return undefined;
};

/**
 * Headers carrying the current operation, or an empty object when there is
 * none. Spreading an empty object leaves published messages unchanged, which
 * keeps the permissive migration window working.
 */
export const operationHeaders = (): Record<string, string> => {
  const operationId = currentOperation();
  return operationId === undefined ? {} : { [OPERATION_HEADER]: operationId };
};
