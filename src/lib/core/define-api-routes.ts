import type { RouteConfig } from './types';

export function defineApiRoutes<const T extends Record<string, RouteConfig>>(
  routes: T,
): T {
  return routes;
}

type MergeRouteGroups<T extends readonly Record<string, RouteConfig>[]> =
  T extends readonly [
    infer First extends Record<string, RouteConfig>,
    ...infer Rest extends readonly Record<string, RouteConfig>[],
  ]
    ? First & MergeRouteGroups<Rest>
    : Record<string, never>;

export function mergeApiRoutes<
  const T extends readonly [
    Record<string, RouteConfig>,
    ...Record<string, RouteConfig>[],
  ],
>(...routeGroups: T): MergeRouteGroups<T>;
export function mergeApiRoutes(
  ...routeGroups: ReadonlyArray<Record<string, RouteConfig>>
): Record<string, RouteConfig> {
  let merged: Record<string, RouteConfig> = {};

  for (const group of routeGroups) {
    merged = { ...merged, ...group };
  }

  return merged;
}
