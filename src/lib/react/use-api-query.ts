import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import { executeCallRoute, type RouteClient } from '../core/call-route';
import {
  areRouteParamsReady,
  type RouteParamsInput,
} from '../core/parse-route';
import { invokeOnError } from '../core/parse-transport-error';
import {
  getMethodConfig,
  type PathsWithGet,
  type PathsWithGetWithoutParams,
  type PathsWithGetWithParams,
  type QueryRouteParamsProp,
  type ResponseOf,
  type RouteRegistryBase,
} from '../core/types';

export type UseApiQueryOptions<
  R extends RouteRegistryBase,
  Path extends PathsWithGet<R>,
> = {
  queryKey?: readonly unknown[];
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  enabled?: boolean;
  onError?: (err: unknown) => void;
} & QueryRouteParamsProp<Path> &
  Omit<
    UseQueryOptions<
      ResponseOf<R, Path, 'get'>,
      unknown,
      ResponseOf<R, Path, 'get'>
    >,
    'queryKey' | 'queryFn' | 'enabled' | 'select'
  >;

export type UseApiQueryOptionsWithoutParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithoutParams<R>,
> = Omit<UseApiQueryOptions<R, Path>, 'params'>;

function buildQueryKey(
  route: string,
  params: RouteParamsInput | undefined,
  queryParams: Record<string, unknown> | undefined,
  customKey: readonly unknown[] | undefined,
): readonly unknown[] {
  const base: unknown[] = customKey ? [...customKey] : [route];
  if (params) {
    base.push(params);
  }
  return [...base, 'get', queryParams];
}

function useApiQueryRun<
  R extends RouteRegistryBase,
  Path extends PathsWithGet<R>,
>(
  client: RouteClient<R>,
  route: Path,
  options?: UseApiQueryOptions<R, Path>,
): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown> {
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
        return await executeCallRoute<R, Path, 'get'>(
          client.routes,
          client.transport,
          route,
          {
            method: 'get',
            queryParams,
            headers,
            params,
          },
        );
      } catch (err: unknown) {
        invokeOnError(onError, methodConfig, err);
        throw err;
      }
    },
  });
}

export type UseApiQueryHook<R extends RouteRegistryBase> = {
  <Path extends PathsWithGetWithParams<R>>(
    route: Path,
    options: UseApiQueryOptions<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;

  <Path extends PathsWithGetWithoutParams<R>>(
    route: Path,
    options?: UseApiQueryOptionsWithoutParams<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;
};

export function createUseApiQuery<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): UseApiQueryHook<R> {
  function useApiQuery<Path extends PathsWithGetWithParams<R>>(
    route: Path,
    options: UseApiQueryOptions<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;

  function useApiQuery<Path extends PathsWithGetWithoutParams<R>>(
    route: Path,
    options?: UseApiQueryOptionsWithoutParams<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;

  function useApiQuery<Path extends PathsWithGet<R>>(
    route: Path,
    options?: UseApiQueryOptions<R, Path>,
  ) {
    return useApiQueryRun(client, route, options);
  }

  return useApiQuery;
}
