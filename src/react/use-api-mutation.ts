import {
  type UseMutateAsyncFunction,
  type UseMutateFunction,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  executeCallRoute,
  getMethodConfig,
  type HttpMethod,
  invokeOnError,
  type MutationArg,
  type MutationHookParamsProp,
  normalizeMutationArg,
  type ResponseOf,
  type RouteClient,
  type RouteRegistryBase,
  type ZodSchema,
} from 'typed-route-client/core';

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

export type UseApiMutationHook<R extends RouteRegistryBase> = <
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
> & { bodySchema: ZodSchema | undefined };

export function createUseApiMutation<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
): UseApiMutationHook<R> {
  function useApiMutation<
    Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
    HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
  >(route: Path, options: UseApiMutationOptionsInput<R, Path, M, HookOptions>) {
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

        return executeCallRoute<R, Path, M>(
          client.routes,
          client.transport,
          route,
          {
            method,
            body,
            queryParams,
            headers,
            ...(params !== undefined ? { params } : {}),
          },
        );
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

    return {
      ...mutation,
      mutate,
      mutateAsync,
      bodySchema,
    };
  }

  return useApiMutation;
}
