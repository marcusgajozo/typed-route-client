import { createRouteClient, type RouteClient } from './core/call-route';
import type { HttpTransport } from './core/http-transport';
import type { RouteRegistryBase } from './core/types';
import {
  createUseApiMutation,
  type UseApiMutationHook,
} from './react/use-api-mutation';
import { createUseApiQuery, type UseApiQueryHook } from './react/use-api-query';

export type ApiClient<R extends RouteRegistryBase> = {
  routeClient: RouteClient<R>;
  useApiQuery: UseApiQueryHook<R>;
  useApiMutation: UseApiMutationHook<R>;
};

export function createApiClient<const R extends RouteRegistryBase>(config: {
  routes: R;
  transport: HttpTransport;
}): ApiClient<R> {
  const routeClient = createRouteClient(config);

  return {
    routeClient,
    useApiQuery: createUseApiQuery(routeClient),
    useApiMutation: createUseApiMutation(routeClient),
  };
}

export type RouteRegistryFromClient<T> =
  T extends RouteClient<infer R>
    ? R
    : T extends { routeClient: RouteClient<infer R> }
      ? R
      : never;
