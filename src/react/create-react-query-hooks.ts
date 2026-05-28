import type { RouteClient, RouteRegistryBase } from 'typed-route-client/core';

import {
  createUseApiMutation,
  type UseApiMutationHook,
} from './use-api-mutation';
import { createUseApiQuery, type UseApiQueryHook } from './use-api-query';

export type ReactQueryHooks<R extends RouteRegistryBase> = {
  useApiQuery: UseApiQueryHook<R>;
  useApiMutation: UseApiMutationHook<R>;
};

export function createReactQueryHooks<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): ReactQueryHooks<R> {
  return {
    useApiQuery: createUseApiQuery(client),
    useApiMutation: createUseApiMutation(client),
  };
}
