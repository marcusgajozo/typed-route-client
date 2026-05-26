import { z } from 'zod';

import { isRecord } from './guards';
import type { MethodConfig } from './types';
import type { HttpMethod, ResponseOf, RouteRegistryBase } from './types';

export function parseResponse<Output>(
  schema: z.ZodType<Output>,
  data: unknown,
): Output {
  return schema.parse(data);
}

export function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.output<T> {
  return schema.parse(body);
}

export function parseErrorResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.output<T> | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

export function parseBodyFromConfig(
  methodConfig: MethodConfig | undefined,
  body: unknown,
): unknown {
  if (!methodConfig?.bodySchema) {
    return body;
  }
  return parseBody(methodConfig.bodySchema, body);
}

function isZodType(value: unknown): value is z.ZodType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'parse' in value &&
    typeof value.parse === 'function'
  );
}

function getMethodEntryFromRegistry(
  routes: unknown,
  route: string,
  method: string,
): unknown {
  if (!isRecord(routes)) {
    return undefined;
  }

  const routeConfig = routes[route];
  if (!isRecord(routeConfig)) {
    return undefined;
  }

  if (!('methods' in routeConfig)) {
    return undefined;
  }

  const methods = routeConfig.methods;
  if (!isRecord(methods)) {
    return undefined;
  }

  return methods[method];
}

export function parseResponseForMethod<
  const R extends RouteRegistryBase,
  const Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
>(routes: R, route: Path, method: M, data: unknown): ResponseOf<R, Path, M>;

export function parseResponseForMethod(
  routes: unknown,
  route: unknown,
  method: unknown,
  data: unknown,
): unknown;

export function parseResponseForMethod(
  routes: unknown,
  route: unknown,
  method: unknown,
  data: unknown,
): unknown {
  if (typeof route !== 'string' || typeof method !== 'string') {
    return data;
  }

  const methodEntry = getMethodEntryFromRegistry(routes, route, method);

  if (
    methodEntry &&
    typeof methodEntry === 'object' &&
    'responseSchema' in methodEntry &&
    methodEntry.responseSchema !== undefined &&
    isZodType(methodEntry.responseSchema)
  ) {
    return parseResponse(methodEntry.responseSchema, data);
  }

  return data;
}
