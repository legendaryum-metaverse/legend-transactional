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

/**
 * The operation as gRPC metadata, for an outgoing call.
 *
 * Same key and same shape as the AMQP headers on purpose: one name for the
 * tenant across both transports. A call made with no operation in scope sends
 * nothing, which is what keeps the permissive migration working.
 *
 * Kept transport-agnostic — a plain record instead of a grpc `Metadata` — so
 * the library does not pick a gRPC client for the services that use it. Each
 * one spreads this into whatever its own client expects.
 */
export const operationMetadata = (): Record<string, string> => operationHeaders();

/**
 * Reads the operation off an incoming gRPC call and runs the handler inside its
 * scope, so anything the handler publishes carries the same tenant.
 *
 * Reading the value without binding the scope is the subtle half-fix: the
 * handler filters its own queries correctly and then emits an event with no
 * operation, which every consumer resolves to Legendaryum.
 *
 * `get` is whatever the caller's gRPC library offers, e.g.
 * `(key) => call.metadata.get(key)[0]?.toString()`.
 */
export const withOperationFromMetadata = <R>(get: (key: string) => string | undefined, fn: () => R): R => {
  const operationId = get(OPERATION_HEADER);
  return withOperation(operationId === '' ? undefined : operationId, fn);
};
