import type { MutationArg } from '../lib/core/types';
import type { RouteRegistryFromClient } from '../lib/create-api-client';
import { apiRoutes } from '../services/api/api-routes';
import type { routeClient } from './client';

type AppRoutes = typeof apiRoutes;
type AppRoutesFromRouteClient = RouteRegistryFromClient<typeof routeClient>;

type AssertRegistryNotNever<T extends Record<string, unknown>> = T;

type PutUserVariables = MutationArg<
  AppRoutes,
  '/users/:userId',
  'put',
  { method: 'put' }
>;

describe('api/client inference', () => {
  it('RouteRegistryFromClient resolves registry from routeClient', () => {
    type Check = AssertRegistryNotNever<AppRoutesFromRouteClient>;
    const path: keyof Check = '/users';
    expect(path).toBe('/users');
  });

  it('mutate variables require body fields from bodySchema', () => {
    const valid: PutUserVariables = {
      params: { userId: 1 },
      body: {
        id: 1,
        username: 'ana',
        email: 'ana@example.com',
        password: 'secret',
      },
    };

    expect(valid).toBeDefined();
  });

  it('rejects body missing required schema fields', () => {
    const invalid: PutUserVariables = {
      params: { userId: 1 },
      // @ts-expect-error body must match bodySchema
      body: {},
    };

    expect(invalid).toBeDefined();
  });
});
