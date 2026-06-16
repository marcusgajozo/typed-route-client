import {
  type UseMutateAsyncFunction,
  type UseMutateFunction,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

import { executeCallRoute, type RouteClient } from '../core/call-route';
import { normalizeMutationArg } from '../core/normalize-mutation-arg';
import { invokeOnError } from '../core/parse-transport-error';
import {
  type BodySchemaOf,
  getMethodConfig,
  type HttpMethod,
  type MutationArg,
  type MutationHookParamsProp,
  readBodySchema,
  type ResponseOf,
  type RouteRegistryBase,
} from '../core/types';

export type UseApiMutationOptionsBase<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  method: M;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  onError?: (err: unknown) => void;
} & MutationHookParamsProp<Path>;

export type UseApiMutationOptions<
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

export type UseApiMutationResult<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
> = UseMutationResult<
  ResponseOf<R, Path, M>,
  unknown,
  MutationArg<R, Path, M, HookOptions>
> & {
  bodySchema: BodySchemaOf<R, Path, M>;
};

export type UseApiMutationHook<R extends RouteRegistryBase> = <
  Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
>(
  route: Path,
  options: UseApiMutationOptionsInput<R, Path, M, HookOptions>,
) => UseApiMutationResult<R, Path, M, HookOptions>;

export function createUseApiMutation<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): UseApiMutationHook<R> {
  const { routes, transport } = client;

  function useApiMutation<
    Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
    HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
  >(
    route: Path,
    options: UseApiMutationOptionsInput<R, Path, M, HookOptions>,
  ): UseApiMutationResult<R, Path, M, HookOptions> {
    const {
      method,
      queryParams,
      headers,
      onError,
      onSuccess,
      params: hookParams,
      ...mutationOptions
    } = options;

    const methodConfig = getMethodConfig(routes, route, method);

    type TData = ResponseOf<R, Path, M>;
    type TVariables = MutationArg<R, Path, M, HookOptions>;

    const mutation = useMutation<TData, unknown, TVariables>({
      ...mutationOptions,
      mutationFn: (arg: TVariables) => {
        const { params, body } = normalizeMutationArg(
          route,
          hookParams,
          methodConfig,
          arg,
        );

        return executeCallRoute<R, Path, M>(routes, transport, route, {
          method,
          body,
          queryParams,
          headers,
          ...(params !== undefined ? { params } : {}),
        });
      },
      onError: (err: unknown) => {
        invokeOnError(onError, methodConfig, err);
      },
      onSuccess,
    });

    const mutate: UseMutateFunction<TData, unknown, TVariables> =
      mutation.mutate;
    const mutateAsync: UseMutateAsyncFunction<TData, unknown, TVariables> =
      mutation.mutateAsync;

    const bodySchema = readBodySchema(methodConfig);

    return {
      ...mutation,
      mutate,
      mutateAsync,
      bodySchema,
    } satisfies UseApiMutationResult<R, Path, M, HookOptions>;
  }

  return useApiMutation;
}
