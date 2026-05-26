import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { RouteClient } from '../core/call-route';
import { invokeOnError } from '../core/parse-transport-error';
import {
  getMethodConfig,
  type PathsWithGet,
  type ResponseOf,
  type RouteParamsProp,
  type RouteParamsRecord,
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
} & RouteParamsProp<Path> &
  Omit<
    UseQueryOptions<
      ResponseOf<R, Path, 'get'>,
      unknown,
      ResponseOf<R, Path, 'get'>
    >,
    'queryKey' | 'queryFn' | 'enabled' | 'select'
  >;

type UseApiQueryOptionsInput<
  R extends RouteRegistryBase,
  Path extends PathsWithGet<R>,
> = Omit<UseApiQueryOptions<R, Path>, 'params'> & {
  params?: RouteParamsRecord;
};

function buildQueryKey(
  route: string,
  params: RouteParamsRecord | undefined,
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
  options: UseApiQueryOptionsInput<R, Path> | undefined,
) {
  const {
    queryKey: customQueryKey,
    queryParams,
    headers,
    enabled = true,
    onError,
    params,
    ...queryOptions
  } = options ?? {};

  const callOptions = {
    route,
    method: 'get' as const,
    queryParams,
    headers,
    ...(params !== undefined ? { params } : {}),
  };

  const queryKey = buildQueryKey(route, params, queryParams, customQueryKey);
  const methodConfig = getMethodConfig(client.routes, route, 'get');

  return useQuery({
    ...queryOptions,
    queryKey,
    enabled,
    queryFn: async () => {
      try {
        return await client.callRoute(callOptions);
      } catch (err: unknown) {
        invokeOnError(onError, methodConfig, err);
        throw err;
      }
    },
  });
}

export function createUseApiQuery<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
) {
  function useApiQuery<Path extends PathsWithGet<R>>(
    route: Path,
  ): ReturnType<typeof useApiQueryRun<R, Path>>;

  function useApiQuery<Path extends PathsWithGet<R> & `${string}:${string}`>(
    route: Path,
    options: UseApiQueryOptions<R, Path>,
  ): ReturnType<typeof useApiQueryRun<R, Path>>;

  function useApiQuery<Path extends PathsWithGet<R>>(
    route: Path,
    options?: UseApiQueryOptionsInput<R, Path>,
  ) {
    return useApiQueryRun(client, route, options);
  }

  return useApiQuery;
}
