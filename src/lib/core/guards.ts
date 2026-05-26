import { HttpTransportError } from './http-transport';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isHttpTransportError(
  value: unknown,
): value is HttpTransportError {
  return value instanceof HttpTransportError;
}

export function hasErrorData(
  err: HttpTransportError,
): err is HttpTransportError & { data: unknown } {
  return err.data !== undefined;
}
