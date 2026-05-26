import type { RouteClient } from '../core/call-route';
import type { RouteRegistryBase } from '../core/types';
import { createUseApiMutation } from './use-api-mutation';
import { createUseApiQuery } from './use-api-query';

export function createReactQueryHooks<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
) {
  return {
    useApiQuery: createUseApiQuery(client),
    useApiMutation: createUseApiMutation(client),
  };
}
