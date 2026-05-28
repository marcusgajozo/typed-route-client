import { z } from 'zod';

import { defineApiRoutes } from './define-api-routes';
import type { HttpTransport, HttpTransportRequest } from './http-transport';

export const testRoutes = defineApiRoutes({
  '/users': {
    methods: {
      get: {
        responseSchema: z.object({ ok: z.boolean() }),
      },
    },
  },
  '/users/:userId': {
    methods: {
      get: {
        responseSchema: z.object({ id: z.number() }),
      },
      put: {
        bodySchema: z.object({ name: z.string() }),
        responseSchema: z.object({ id: z.number(), name: z.string() }),
        errorSchema: z.object({ message: z.string() }),
      },
    },
  },
});

export function createMockTransport(
  impl: (
    req: HttpTransportRequest,
  ) => Promise<{ data: unknown; status: number }>,
): HttpTransport {
  return {
    request: impl,
  };
}
