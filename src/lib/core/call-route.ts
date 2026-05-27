import type { HttpTransport } from './http-transport';
import {
  assertRouteParamsReady,
  parseRoute,
  type RouteParamsInput,
} from './parse-route';
import { parseBodyFromConfig, parseResponseForMethod } from './parse-response';
import { getMethodConfig } from './types';
import type {
  HasPathParams,
  HttpMethod,
  PathsWithGetWithoutParams,
  PathsWithGetWithParams,
  QueryRouteParamsProp,
  ResponseOf,
  RouteParamsFromPath,
  RouteRegistryBase,
} from './types';

export type CallRouteParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  method: M;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
} & (HasPathParams<Path> extends true
  ? { params: RouteParamsFromPath<Path> }
  : { params?: never });

export type CallRouteGetOptionsWithoutParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithoutParams<R>,
> = Omit<CallRouteParams<R, Path, 'get'>, 'method' | 'params'> & {
  method?: 'get';
};

export type CallRouteGetOptionsWithParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithParams<R>,
> = Omit<CallRouteParams<R, Path, 'get'>, 'method' | 'params'> & {
  method?: 'get';
} & QueryRouteParamsProp<Path>;

export type RunCallRouteOptions<M extends HttpMethod = HttpMethod> = {
  method: M;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: RouteParamsInput;
};

type CallRouteDispatchOptions = {
  method?: HttpMethod;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: RouteParamsInput;
};

function isMutationMethod(
  method: HttpMethod | undefined,
): method is Exclude<HttpMethod, 'get'> {
  return method !== undefined && method !== 'get';
}

export type RouteClient<R extends RouteRegistryBase> = {
  callRoute<Path extends PathsWithGetWithoutParams<R>>(
    route: Path,
    options?: CallRouteGetOptionsWithoutParams<R, Path>,
  ): Promise<ResponseOf<R, Path, 'get'>>;

  callRoute<Path extends PathsWithGetWithParams<R>>(
    route: Path,
    options: CallRouteGetOptionsWithParams<R, Path>,
  ): Promise<ResponseOf<R, Path, 'get'>>;

  callRoute<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: CallRouteParams<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>>;

  runCallRoute<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: RunCallRouteOptions<M>,
  ): Promise<ResponseOf<R, Path, M>>;

  routes: R;
};

export async function runCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptions<M>,
): Promise<ResponseOf<R, Path, M>> {
  const { method, body, queryParams, headers, params } = options;

  assertRouteParamsReady(route, params);

  const methodConfig = getMethodConfig(routes, route, method);
  const parsedUrl = parseRoute(route, params);
  const validatedBody = parseBodyFromConfig(methodConfig, body);

  const response = await transport.request({
    method,
    url: parsedUrl,
    body: validatedBody,
    queryParams,
    headers,
  });

  return parseResponseForMethod(routes, route, method, response.data);
}

export function createRouteClient<const R extends RouteRegistryBase>(config: {
  routes: R;
  transport: HttpTransport;
}): RouteClient<R> {
  const { routes, transport } = config;

  const runCallRouteBound = <
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: RunCallRouteOptions<M>,
  ): Promise<ResponseOf<R, Path, M>> =>
    runCallRoute(routes, transport, route, options);

  async function callRoute<Path extends PathsWithGetWithoutParams<R>>(
    route: Path,
    options?: CallRouteGetOptionsWithoutParams<R, Path>,
  ): Promise<ResponseOf<R, Path, 'get'>>;

  async function callRoute<Path extends PathsWithGetWithParams<R>>(
    route: Path,
    options: CallRouteGetOptionsWithParams<R, Path>,
  ): Promise<ResponseOf<R, Path, 'get'>>;

  async function callRoute<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: CallRouteParams<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>>;

  async function callRoute(
    route: keyof R & string,
    options?: CallRouteDispatchOptions,
  ) {
    if (options === undefined) {
      return runCallRoute(routes, transport, route, { method: 'get' });
    }

    if (isMutationMethod(options.method)) {
      return runCallRoute(routes, transport, route, {
        method: options.method,
        body: options.body,
        queryParams: options.queryParams,
        headers: options.headers,
        params: options.params,
      });
    }

    return runCallRoute(routes, transport, route, {
      method: 'get',
      queryParams: options.queryParams,
      headers: options.headers,
      params: options.params,
    });
  }

  return { callRoute, routes, runCallRoute: runCallRouteBound };
}
