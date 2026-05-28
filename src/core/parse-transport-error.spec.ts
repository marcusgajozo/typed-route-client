import { z } from 'zod';

import { HttpTransportError } from './http-transport';
import { invokeOnError, resolveApiError } from './parse-transport-error';
import type { MethodConfig } from './types';

describe('parse-transport-error', () => {
  const methodConfig: MethodConfig = {
    errorSchema: z.object({ message: z.string() }),
  };

  it('returns original error when it is not HttpTransportError', () => {
    const err = new Error('network');
    expect(resolveApiError(methodConfig, err)).toBe(err);
  });

  it('parses transport error data with error schema', () => {
    const err = new HttpTransportError({
      status: 400,
      data: { message: 'invalid' },
      raw: {},
    });

    expect(resolveApiError(methodConfig, err)).toEqual({ message: 'invalid' });
  });

  it('returns original transport error when parsed data is invalid', () => {
    const err = new HttpTransportError({
      status: 400,
      data: { message: 1 },
      raw: {},
    });

    expect(resolveApiError(methodConfig, err)).toBe(err);
  });

  it('invokeOnError calls callback with resolved error', () => {
    const onError = jest.fn();
    const err = new HttpTransportError({
      status: 400,
      data: { message: 'invalid' },
      raw: {},
    });

    invokeOnError(onError, methodConfig, err);

    expect(onError).toHaveBeenCalledWith({ message: 'invalid' });
  });

  it('invokeOnError does nothing when callback is undefined', () => {
    expect(() => {
      invokeOnError(undefined, methodConfig, new Error('x'));
    }).not.toThrow();
  });
});
