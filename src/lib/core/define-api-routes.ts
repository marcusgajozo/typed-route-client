import type { RouteConfig } from './types';

export function defineApiRoutes<const T extends Record<string, RouteConfig>>(
  routes: T,
): T {
  return routes;
}
