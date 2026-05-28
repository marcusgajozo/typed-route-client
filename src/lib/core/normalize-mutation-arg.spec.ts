import { z } from 'zod';

import { normalizeMutationArg } from './normalize-mutation-arg';
import type { MethodConfig } from './types';

describe('normalize-mutation-arg', () => {
  const bodyConfig: MethodConfig = {
    bodySchema: z.object({ name: z.string() }),
  };

  it('returns body only for static routes without hook params', () => {
    expect(
      normalizeMutationArg('/users', undefined, bodyConfig, { name: 'Ana' }),
    ).toEqual({ body: { name: 'Ana' } });
  });

  it('requires params and body for param routes with body schema', () => {
    expect(() =>
      normalizeMutationArg('/users/:userId', undefined, bodyConfig, {
        params: { userId: 1 },
      }),
    ).toThrow('requires { params, body }');
  });

  it('accepts explicit params and body', () => {
    expect(
      normalizeMutationArg('/users/:userId', undefined, bodyConfig, {
        params: { userId: 1 },
        body: { name: 'Ana' },
      }),
    ).toEqual({
      params: { userId: 1 },
      body: { name: 'Ana' },
    });
  });

  it('uses hook params when argument only contains body', () => {
    expect(
      normalizeMutationArg('/users/:userId', { userId: 9 }, bodyConfig, {
        body: { name: 'Ana' },
      }),
    ).toEqual({
      params: { userId: 9 },
      body: { name: 'Ana' },
    });
  });

  it('returns hook params when route has params and no body schema', () => {
    expect(
      normalizeMutationArg(
        '/users/:userId',
        { userId: 3 },
        undefined,
        undefined,
      ),
    ).toEqual({ params: { userId: 3 } });
  });
});
