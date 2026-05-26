import type { HttpTransport } from './http-transport';
import { parseRoute } from './parse-route';
import { parseBodyFromConfig, parseResponseForMethod } from './parse-response';
import { getMethodConfig } from './types';
import type { HttpMethod, ResponseOf, RouteRegistryBase } from './types';

export type CallRouteOptions<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  route: Path;
  method: M;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
};

export type RouteClient<R extends RouteRegistryBase> = {
  callRoute<
    Path extends keyof R & string,
    M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    options: CallRouteOptions<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>>;
  routes: R;
};

export function createRouteClient<const R extends RouteRegistryBase>(config: {
  routes: R;
  transport: HttpTransport;
}): RouteClient<R> {
  const { routes, transport } = config;

  async function callRoute<
    const Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
  >(options: CallRouteOptions<R, Path, M>): Promise<ResponseOf<R, Path, M>> {
    const { route, method, body, queryParams, headers, params } = options;

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

  return { callRoute, routes };
}
