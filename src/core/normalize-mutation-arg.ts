import { isRecord } from './guards';
import { extractRouteParamNames, type RouteParamsInput } from './parse-route';
import type { MethodConfig } from './types';

export type NormalizedMutationArg = {
  params?: RouteParamsInput;
  body?: unknown;
};

function isRouteParamsInput(value: unknown): value is RouteParamsInput {
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      entry === undefined ||
      typeof entry === 'string' ||
      typeof entry === 'number',
  );
}

function isExplicitMutationArg(
  value: unknown,
): value is { params: RouteParamsInput; body?: unknown } {
  return (
    isRecord(value) && 'params' in value && isRouteParamsInput(value.params)
  );
}

export function normalizeMutationArg(
  route: string,
  hookParams: RouteParamsInput | undefined,
  methodConfig: MethodConfig | undefined,
  arg: unknown,
): NormalizedMutationArg {
  if (hookParams) {
    const hasBodySchema = Boolean(methodConfig?.bodySchema);

    if (hasBodySchema) {
      if (!isRecord(arg) || !('body' in arg)) {
        throw new Error(
          `Route "${route}" requires { body } or { params?, body } when params are set on the hook.`,
        );
      }
      const params =
        'params' in arg && isRouteParamsInput(arg.params)
          ? arg.params
          : hookParams;
      return { params, body: arg.body };
    }

    if (isExplicitMutationArg(arg)) {
      return { params: arg.params, body: arg.body };
    }
    if (isRecord(arg) && 'params' in arg && isRouteParamsInput(arg.params)) {
      return { params: arg.params };
    }
    return { params: hookParams };
  }

  const paramNames = extractRouteParamNames(route);
  const hasBodySchema = Boolean(methodConfig?.bodySchema);

  if (paramNames.length === 0) {
    return { body: arg };
  }

  if (isExplicitMutationArg(arg)) {
    if (hasBodySchema && !('body' in arg)) {
      throw new Error(
        `Route "${route}" requires { params, body } when a body schema is defined.`,
      );
    }
    return {
      params: arg.params,
      body: arg.body,
    };
  }

  if (!isRecord(arg)) {
    throw new Error('Mutation argument must be an object.');
  }

  if (hasBodySchema) {
    if ('body' in arg && 'params' in arg && isRouteParamsInput(arg.params)) {
      return { params: arg.params, body: arg.body };
    }
    throw new Error(
      `Route "${route}" requires { params, body } when a body schema is defined.`,
    );
  }

  if ('params' in arg && isRouteParamsInput(arg.params)) {
    return { params: arg.params };
  }

  throw new Error(
    `Route "${route}" requires { params } when path params are defined.`,
  );
}
