import type { HttpTransport } from './http-transport';
import { parseBodyFromConfig, parseResponseForMethod } from './parse-response';
import {
  assertRouteParamsReady,
  parseRoute,
  type RouteParamsInput,
} from './parse-route';
import {
  type BodyOf,
  getMethodConfig,
  type HasPathParams,
  type HttpMethod,
  type PathsWithGetWithoutParams,
  type PathsWithGetWithParams,
  type QueryRouteParamsProp,
  type ResponseOf,
  type RouteParamName,
  type RouteRegistryBase,
} from './types';

export type RunCallRouteOptionsForPath<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  method: M;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
} & (HasPathParams<Path> extends true
  ? { params: { [K in RouteParamName<Path>]: string | number } }
  : { params?: never }) &
  (BodyOf<R, Path, M> extends undefined
    ? { body?: never }
    : { body?: BodyOf<R, Path, M> });

export type CallRouteParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = RunCallRouteOptionsForPath<R, Path, M>;

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

export type RunCallRouteOptionsLoose<M extends HttpMethod = HttpMethod> = {
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
    options: RunCallRouteOptionsForPath<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>>;

  routes: R;
  transport: HttpTransport;
};

export async function executeCallRoute<
  R extends RouteRegistryBase,
  const Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsLoose<M>,
): Promise<ResponseOf<R, Path, M>>;
export async function executeCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsLoose<M>,
): Promise<ResponseOf<R, Path, M>>;
export async function executeCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsLoose<M>,
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

export async function runCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsForPath<R, Path, M>,
): Promise<ResponseOf<R, Path, M>> {
  return executeCallRoute(routes, transport, route, options);
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
    options: RunCallRouteOptionsForPath<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>> =>
    executeCallRoute(routes, transport, route, options);

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
      return executeCallRoute(routes, transport, route, { method: 'get' });
    }

    if (isMutationMethod(options.method)) {
      return executeCallRoute(routes, transport, route, {
        method: options.method,
        body: options.body,
        queryParams: options.queryParams,
        headers: options.headers,
        params: options.params,
      });
    }

    return executeCallRoute(routes, transport, route, {
      method: 'get',
      queryParams: options.queryParams,
      headers: options.headers,
      params: options.params,
    });
  }

  return { callRoute, routes, runCallRoute: runCallRouteBound, transport };
}
