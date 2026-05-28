import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { executeCallRoute, type RouteClient } from '../core/call-route';
import { normalizeMutationArg } from '../core/normalize-mutation-arg';
import { invokeOnError } from '../core/parse-transport-error';
import {
  getMethodConfig,
  type HttpMethod,
  type MutationArg,
  type MutationHookParamsProp,
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
      MutationArg<R, Path, M, HookOptions & { method: M }>
    >,
    'mutationFn' | 'onError'
  >;

type UseApiMutationOptionsInput<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends UseApiMutationOptionsBase<R, Path, M>,
> = UseApiMutationOptions<R, Path, M, HookOptions>;

export function createUseApiMutation<const R extends RouteRegistryBase>(
  client: RouteClient<R>,
) {
  return function useApiMutation<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
    const Options extends UseApiMutationOptionsBase<R, Path, M>,
  >(route: Path, options: UseApiMutationOptionsInput<R, Path, M, Options>) {
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

    type Variables = MutationArg<R, Path, Options['method'], Options>;

    const mutation = useMutation({
      ...mutationOptions,
      mutationFn: (arg: Variables) => {
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

    return {
      ...mutation,
      bodySchema,
    };
  };
}
