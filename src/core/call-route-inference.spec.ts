import { z } from 'zod';

import { createMockTransport, testRoutes } from '../test/core-utils';
import { createRouteClient } from './call-route';
import { defineApiRoutes, mergeApiRoutes } from './define-api-routes';

describe('call-route inference', () => {
  it('callRoute infers params and body for mutations on testRoutes', () => {
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(jest.fn()),
    });

    function typeCheck() {
      return client.callRoute('/users/:userId', {
        method: 'put',
        params: { userId: 1 },
        body: { name: 'Ana' },
      });
    }

    expect(typeCheck).toBeDefined();
  });

  it('callRoute infers params and body after mergeApiRoutes', () => {
    const userRoutes = defineApiRoutes({
      '/users/:userId': {
        methods: {
          put: {
            bodySchema: z.object({ name: z.string() }),
          },
        },
      },
    });

    const merged = mergeApiRoutes(userRoutes);
    const client = createRouteClient({
      routes: merged,
      transport: createMockTransport(jest.fn()),
    });

    function typeCheck() {
      return client.callRoute('/users/:userId', {
        method: 'put',
        params: { userId: 1 },
        body: { name: 'Ana' },
      });
    }

    function typeCheckMissingParam() {
      // @ts-expect-error userId is required in params
      return client.callRoute('/users/:userId', {
        method: 'put',
        params: {},
        body: { name: 'Ana' },
      });
    }

    expect(typeCheck).toBeDefined();
    expect(typeCheckMissingParam).toBeDefined();
  });
});
