import { z } from 'zod';

import { defineApiRoutes } from '../core/define-api-routes';
import type {
  HttpTransport,
  HttpTransportRequest,
} from '../core/http-transport';

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

export function createMockTransport<TContext = undefined>(
  impl: (
    req: HttpTransportRequest<TContext>,
  ) => Promise<{ data: unknown; status: number }>,
): HttpTransport<TContext> {
  return {
    request: impl,
  };
}
