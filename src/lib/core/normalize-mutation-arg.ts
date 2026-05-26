import { isRecord } from './guards';
import { extractRouteParamNames, type RouteParamsInput } from './parse-route';
import type { MethodConfig } from './types';

export type NormalizedMutationArg = {
  params?: RouteParamsInput;
  body?: unknown;
};

function isExplicitMutationArg(
  value: unknown,
): value is { params: RouteParamsInput; body?: unknown } {
  return isRecord(value) && 'params' in value && isRecord(value.params);
}

export function normalizeMutationArg(
  route: string,
  hookParams: RouteParamsInput | undefined,
  methodConfig: MethodConfig | undefined,
  arg: unknown,
): NormalizedMutationArg {
  if (hookParams) {
    return {
      params: hookParams,
      body: arg,
    };
  }

  const paramNames = extractRouteParamNames(route);
  const hasBodySchema = Boolean(methodConfig?.bodySchema);

  if (paramNames.length === 0) {
    return { body: arg };
  }

  if (typeof arg === 'string' || typeof arg === 'number') {
    if (paramNames.length !== 1) {
      throw new Error(
        `Route "${route}" has multiple params; pass an object with param names.`,
      );
    }
    const paramName = paramNames[0];
    if (!paramName) {
      throw new Error(`Route "${route}" has invalid param name.`);
    }
    return { params: { [paramName]: arg } };
  }

  if (isExplicitMutationArg(arg)) {
    return {
      params: arg.params,
      body: arg.body,
    };
  }

  if (!isRecord(arg)) {
    throw new Error('Mutation argument must be an object, string, or number.');
  }

  if (hasBodySchema && paramNames.length === 1) {
    const paramName = paramNames[0];
    if (paramName && paramName in arg) {
      const { [paramName]: paramValue, ...body } = arg;
      if (typeof paramValue !== 'string' && typeof paramValue !== 'number') {
        throw new Error(
          `Route param "${paramName}" must be a string or number.`,
        );
      }
      return {
        params: { [paramName]: paramValue },
        body,
      };
    }
  }

  if (hasBodySchema) {
    throw new Error(
      `Route "${route}" requires { params, body } when multiple params exist.`,
    );
  }

  const params: RouteParamsInput = {};
  for (const [key, value] of Object.entries(arg)) {
    if (typeof value === 'string' || typeof value === 'number') {
      params[key] = value;
    } else {
      throw new Error(`Route param "${key}" must be a string or number.`);
    }
  }
  return { params };
}
