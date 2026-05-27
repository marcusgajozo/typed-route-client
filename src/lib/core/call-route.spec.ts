import { runCallRoute } from './call-route';
import { z } from 'zod';
import { defineApiRoutes } from './define-api-routes';
import type { HttpTransport } from './http-transport';

describe('runCallRoute', () => {
  const testRoutes = defineApiRoutes({
    '/users': {
      methods: {
        get: { responseSchema: z.object({ ok: z.boolean() }) },
      },
    },
    '/users/:userId': {
      methods: {
        put: {
          bodySchema: z.object({ name: z.string() }),
          responseSchema: z.object({ id: z.number() }),
        },
      },
    },
  });

  function createMockTransport(impl: HttpTransport['request']): HttpTransport {
    return { request: impl };
  }

  it('GET sem params chama transport e retorna response validado', async () => {
    const request = jest.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
    });

    const transport = createMockTransport(request);

    const result = await runCallRoute(testRoutes, transport, '/users', {
      method: 'get',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/users',
      body: undefined,
      queryParams: undefined,
      headers: undefined,
    });

    expect(result).toEqual({ ok: true });
  });
});
