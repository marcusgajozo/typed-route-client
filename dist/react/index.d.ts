import {
  RouteRegistryBase,
  HttpMethod,
  MutationHookParamsProp,
  ResponseOf,
  MutationArg,
  ZodSchema,
  RouteClient,
  PathsWithGetWithParams,
  PathsWithGet,
  QueryRouteParamsProp,
  PathsWithGetWithoutParams,
  HttpTransport,
} from 'typed-route-client/core';
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

type UseApiMutationOptionsBase<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  method: M;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  onError?: (err: unknown) => void;
} & MutationHookParamsProp<Path>;
type UseApiMutationOptions<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M> =
    UseApiMutationOptionsBase<R, Path, M>,
> = HookOptions &
  Omit<
    UseMutationOptions<
      ResponseOf<R, Path, M>,
      unknown,
      MutationArg<R, Path, M, HookOptions>
    >,
    'mutationFn' | 'onError'
  >;
type UseApiMutationOptionsInput<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
> = UseApiMutationOptions<R, Path, M, HookOptions>;
type UseApiMutationHook<R extends RouteRegistryBase> = <
  Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
>(
  route: Path,
  options: UseApiMutationOptionsInput<R, Path, M, HookOptions>,
) => UseMutationResult<
  ResponseOf<R, Path, M>,
  unknown,
  MutationArg<R, Path, M, HookOptions>
> & {
  bodySchema: ZodSchema | undefined;
};
declare function createUseApiMutation<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): UseApiMutationHook<R>;

type UseApiQueryOptions<
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
type UseApiQueryOptionsWithoutParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithoutParams<R>,
> = Omit<UseApiQueryOptions<R, Path>, 'params'>;
type UseApiQueryHook<R extends RouteRegistryBase> = {
  <Path extends PathsWithGetWithParams<R>>(
    route: Path,
    options: UseApiQueryOptions<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;
  <Path extends PathsWithGetWithoutParams<R>>(
    route: Path,
    options?: UseApiQueryOptionsWithoutParams<R, Path>,
  ): UseQueryResult<ResponseOf<R, Path, 'get'>, unknown>;
};
declare function createUseApiQuery<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): UseApiQueryHook<R>;

type ApiClient<R extends RouteRegistryBase> = {
  routeClient: RouteClient<R>;
  useApiQuery: UseApiQueryHook<R>;
  useApiMutation: UseApiMutationHook<R>;
};
declare function createApiClient<const R extends RouteRegistryBase>(config: {
  routes: R;
  transport: HttpTransport;
}): ApiClient<R>;
type RouteRegistryFromClient<T> =
  T extends RouteClient<infer R>
    ? R
    : T extends {
          routeClient: RouteClient<infer R>;
        }
      ? R
      : never;

type ReactQueryHooks<R extends RouteRegistryBase> = {
  useApiQuery: UseApiQueryHook<R>;
  useApiMutation: UseApiMutationHook<R>;
};
declare function createReactQueryHooks<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): ReactQueryHooks<R>;

export {
  type ApiClient,
  type ReactQueryHooks,
  type RouteRegistryFromClient,
  type UseApiMutationHook,
  type UseApiMutationOptions,
  type UseApiMutationOptionsBase,
  type UseApiQueryHook,
  type UseApiQueryOptions,
  type UseApiQueryOptionsWithoutParams,
  createApiClient,
  createReactQueryHooks,
  createUseApiMutation,
  createUseApiQuery,
};
