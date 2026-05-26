import type { HttpTransportError } from './http-transport';
import { hasErrorData, isHttpTransportError } from './guards';
import { parseErrorResponse } from './parse-response';
import type { MethodConfig } from './types';

export function resolveApiError(
  methodConfig: MethodConfig | undefined,
  err: unknown,
): unknown {
  if (!isHttpTransportError(err) || !methodConfig?.errorSchema) {
    return err;
  }

  if (!hasErrorData(err)) {
    return err;
  }

  const parsed = parseErrorResponse(methodConfig.errorSchema, err.data);
  return parsed ?? err;
}

export type OnErrorCallback<TError> = [TError] extends [never]
  ? (err: unknown) => void
  : (err: TError | Error | HttpTransportError) => void;

export function invokeOnError(
  onError: ((err: unknown) => void) | undefined,
  methodConfig: MethodConfig | undefined,
  err: unknown,
): void {
  if (!onError) {
    return;
  }
  onError(resolveApiError(methodConfig, err));
}
