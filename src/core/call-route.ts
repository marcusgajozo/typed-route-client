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
  type PathsWithGet,
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
  TContext = undefined,
> = {
  method: M;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  context?: TContext;
} & (HasPathParams<Path> extends true
  ? { params: { [K in RouteParamName<Path>]: string | number } }
  : { params?: never }) &
  (BodyOf<R, Path, M> extends undefined
    ? { body?: never }
    : { body: BodyOf<R, Path, M> });

export type CallRouteParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  TContext = undefined,
> = RunCallRouteOptionsForPath<R, Path, M, TContext>;

export type CallRouteGetOptionsWithoutParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithoutParams<R>,
  TContext = undefined,
> = Omit<CallRouteParams<R, Path, 'get', TContext>, 'method' | 'params'> & {
  method?: 'get';
};

export type CallRouteGetOptionsWithParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithParams<R>,
  TContext = undefined,
> = Omit<CallRouteParams<R, Path, 'get', TContext>, 'method' | 'params'> & {
  method?: 'get';
} & QueryRouteParamsProp<Path>;

export type CallRouteGetOptionsForPath<
  R extends RouteRegistryBase,
  Path extends PathsWithGet<R>,
  TContext = undefined,
> = Omit<CallRouteParams<R, Path, 'get', TContext>, 'method' | 'params'> & {
  method?: 'get';
} & (HasPathParams<Path> extends true
    ? QueryRouteParamsProp<Path>
    : { params?: never });

export type RunCallRouteOptionsLoose<
  M extends HttpMethod = HttpMethod,
  TContext = undefined,
> = {
  method: M;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: RouteParamsInput;
  context?: TContext;
};

export type CallRouteDispatchOptions<TContext = undefined> = {
  method?: HttpMethod;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: RouteParamsInput;
  context?: TContext;
};

function isMutationMethod(
  method: HttpMethod | undefined,
): method is Exclude<HttpMethod, 'get'> {
  return method !== undefined && method !== 'get';
}

export type RouteClient<
  R extends RouteRegistryBase,
  TContext = undefined,
> = {
  callRoute<
    Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: CallRouteParams<R, Path, M, TContext>,
  ): Promise<ResponseOf<R, Path, M>>;

  callRoute<Path extends PathsWithGet<R>>(
    route: Path,
    ...args: HasPathParams<Path> extends true
      ? [options: CallRouteGetOptionsForPath<R, Path, TContext>]
      : [options?: CallRouteGetOptionsForPath<R, Path, TContext>]
  ): Promise<ResponseOf<R, Path, 'get'>>;

  runCallRoute<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: RunCallRouteOptionsForPath<R, Path, M, TContext>,
  ): Promise<ResponseOf<R, Path, M>>;

  routes: R;
  transport: HttpTransport<TContext>;
};

export async function executeCallRoute<
  R extends RouteRegistryBase,
  const Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
  TContext = undefined,
>(
  routes: R,
  transport: HttpTransport<TContext>,
  route: Path,
  options: RunCallRouteOptionsLoose<M, TContext>,
): Promise<ResponseOf<R, Path, M>>;
export async function executeCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  TContext = undefined,
>(
  routes: R,
  transport: HttpTransport<TContext>,
  route: Path,
  options: RunCallRouteOptionsLoose<M, TContext>,
): Promise<ResponseOf<R, Path, M>>;
export async function executeCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  TContext = undefined,
>(
  routes: R,
  transport: HttpTransport<TContext>,
  route: Path,
  options: RunCallRouteOptionsLoose<M, TContext>,
): Promise<ResponseOf<R, Path, M>> {
  const { method, body, queryParams, headers, params, context } = options;

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
    context,
  });

  return parseResponseForMethod(routes, route, method, response.data);
}

export async function runCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  TContext = undefined,
>(
  routes: R,
  transport: HttpTransport<TContext>,
  route: Path,
  options: RunCallRouteOptionsForPath<R, Path, M, TContext>,
): Promise<ResponseOf<R, Path, M>> {
  return executeCallRoute(routes, transport, route, options);
}

export function createRouteClient<
  const R extends RouteRegistryBase,
  TContext = undefined,
>(config: {
  routes: R;
  transport: HttpTransport<TContext>;
}): RouteClient<R, TContext> {
  const { routes, transport } = config;

  const runCallRouteBound = <
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: RunCallRouteOptionsForPath<R, Path, M, TContext>,
  ): Promise<ResponseOf<R, Path, M>> =>
    executeCallRoute(routes, transport, route, options);

  async function callRoute<
    Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: CallRouteParams<R, Path, M, TContext>,
  ): Promise<ResponseOf<R, Path, M>>;

  async function callRoute<Path extends PathsWithGet<R>>(
    route: Path,
    ...args: HasPathParams<Path> extends true
      ? [options: CallRouteGetOptionsForPath<R, Path, TContext>]
      : [options?: CallRouteGetOptionsForPath<R, Path, TContext>]
  ): Promise<ResponseOf<R, Path, 'get'>>;

  async function callRoute(
    route: keyof R & string,
    options?: CallRouteDispatchOptions<TContext>,
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
        context: options.context,
      });
    }

    return executeCallRoute(routes, transport, route, {
      method: 'get',
      queryParams: options.queryParams,
      headers: options.headers,
      params: options.params,
      context: options.context,
    });
  }

  const client = {
    callRoute,
    routes,
    runCallRoute: runCallRouteBound,
    transport,
  } satisfies RouteClient<R, TContext>;

  return client;
}
