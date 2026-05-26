export function parseRoute(
  route: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return route;
  }

  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
    route,
  );
}

const PARAM_PATTERN = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function extractRouteParamNames(route: string): string[] {
  const names: string[] = [];
  let match = PARAM_PATTERN.exec(route);

  while (match !== null) {
    const name = match[1];
    if (name) {
      names.push(name);
    }
    match = PARAM_PATTERN.exec(route);
  }

  PARAM_PATTERN.lastIndex = 0;
  return names;
}

export function hasRouteParams(route: string): boolean {
  return extractRouteParamNames(route).length > 0;
}
