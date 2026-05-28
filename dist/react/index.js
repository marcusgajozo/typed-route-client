import {
  createRouteClient,
  getMethodConfig,
  invokeOnError,
  normalizeMutationArg,
  executeCallRoute,
  areRouteParamsReady,
} from 'typed-route-client/core';
import { useMutation, useQuery } from '@tanstack/react-query';

// src/react/create-api-client.ts
function createUseApiMutation(client) {
  function useApiMutation(route, options) {
    const {
      method,
      queryParams,
      headers,
      onError,
      onSuccess,
      params: hookParams,
      ...mutationOptions
    } = options;
    const methodConfig = getMethodConfig(client.routes, route, method);
    const bodySchema = methodConfig?.bodySchema;
    const mutation = useMutation({
      ...mutationOptions,
      mutationFn: (arg) => {
        const { params, body } = normalizeMutationArg(
          route,
          hookParams,
          methodConfig,
          arg,
        );
        return executeCallRoute(client.routes, client.transport, route, {
          method,
          body,
          queryParams,
          headers,
          ...(params !== void 0 ? { params } : {}),
        });
      },
      onError: (err) => {
        invokeOnError(onError, methodConfig, err);
      },
      onSuccess,
    });
    const mutate = mutation.mutate;
    const mutateAsync = mutation.mutateAsync;
    return {
      ...mutation,
      mutate,
      mutateAsync,
      bodySchema,
    };
  }
  return useApiMutation;
}
function buildQueryKey(route, params, queryParams, customKey) {
  const base = customKey ? [...customKey] : [route];
  if (params) {
    base.push(params);
  }
  return [...base, 'get', queryParams];
}
function useApiQueryRun(client, route, options) {
  const {
    queryKey: customQueryKey,
    queryParams,
    headers,
    enabled = true,
    onError,
    params,
    ...queryOptions
  } = options ?? {};
  const queryKey = buildQueryKey(route, params, queryParams, customQueryKey);
  const methodConfig = getMethodConfig(client.routes, route, 'get');
  const isParamsReady = areRouteParamsReady(route, params);
  return useQuery({
    ...queryOptions,
    queryKey,
    enabled: enabled && isParamsReady,
    queryFn: async () => {
      try {
        return await executeCallRoute(client.routes, client.transport, route, {
          method: 'get',
          queryParams,
          headers,
          params,
        });
      } catch (err) {
        invokeOnError(onError, methodConfig, err);
        throw err;
      }
    },
  });
}
function createUseApiQuery(client) {
  function useApiQuery(route, options) {
    return useApiQueryRun(client, route, options);
  }
  return useApiQuery;
}

// src/react/create-api-client.ts
function createApiClient(config) {
  const routeClient = createRouteClient(config);
  return {
    routeClient,
    useApiQuery: createUseApiQuery(routeClient),
    useApiMutation: createUseApiMutation(routeClient),
  };
}

// src/react/create-react-query-hooks.ts
function createReactQueryHooks(client) {
  return {
    useApiQuery: createUseApiQuery(client),
    useApiMutation: createUseApiMutation(client),
  };
}

export {
  createApiClient,
  createReactQueryHooks,
  createUseApiMutation,
  createUseApiQuery,
};
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
