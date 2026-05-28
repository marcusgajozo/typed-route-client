import 'zod';

// src/core/parse-response.ts

// src/core/http-transport.ts
var HttpTransportError = class extends Error {
  status;
  data;
  raw;
  constructor(options) {
    super(options.message ?? 'HTTP request failed');
    this.name = 'HttpTransportError';
    this.status = options.status;
    this.data = options.data;
    this.raw = options.raw;
  }
};

// src/core/guards.ts
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isHttpTransportError(value) {
  return value instanceof HttpTransportError;
}
function hasErrorData(err) {
  return err.data !== void 0;
}

// src/core/parse-response.ts
function parseResponse(schema, data) {
  return schema.parse(data);
}
function parseBody(schema, body) {
  return schema.parse(body);
}
function parseErrorResponse(schema, data) {
  const result = schema.safeParse(data);
  return result.success ? result.data : void 0;
}
function parseBodyFromConfig(methodConfig, body) {
  if (!methodConfig?.bodySchema) {
    return body;
  }
  return parseBody(methodConfig.bodySchema, body);
}
function isZodType(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'parse' in value &&
    typeof value.parse === 'function'
  );
}
function getMethodEntryFromRegistry(routes, route, method) {
  if (!isRecord(routes)) {
    return void 0;
  }
  const routeConfig = routes[route];
  if (!isRecord(routeConfig)) {
    return void 0;
  }
  if (!('methods' in routeConfig)) {
    return void 0;
  }
  const methods = routeConfig.methods;
  if (!isRecord(methods)) {
    return void 0;
  }
  return methods[method];
}
function parseResponseForMethod(routes, route, method, data) {
  if (typeof route !== 'string' || typeof method !== 'string') {
    return data;
  }
  const methodEntry = getMethodEntryFromRegistry(routes, route, method);
  if (
    methodEntry &&
    typeof methodEntry === 'object' &&
    'responseSchema' in methodEntry &&
    methodEntry.responseSchema !== void 0 &&
    isZodType(methodEntry.responseSchema)
  ) {
    return parseResponse(methodEntry.responseSchema, data);
  }
  return data;
}

// src/core/parse-route.ts
function parseRoute(route, params) {
  if (!params) {
    return route;
  }
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
    route,
  );
}
var PARAM_PATTERN = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
function extractRouteParamNames(route) {
  const names = [];
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
function hasRouteParams(route) {
  return extractRouteParamNames(route).length > 0;
}
function areRouteParamsReady(route, params) {
  const names = extractRouteParamNames(route);
  if (names.length === 0) {
    return true;
  }
  if (params === void 0) {
    return false;
  }
  return names.every((name) => params[name] !== void 0);
}
function assertRouteParamsReady(route, params) {
  if (!areRouteParamsReady(route, params)) {
    const names = extractRouteParamNames(route);
    throw new Error(`Missing route params for "${route}": ${names.join(', ')}`);
  }
}

// src/core/types.ts
function isMethodConfigEntry(value) {
  return typeof value === 'object' && value !== null;
}
function getMethodConfig(routes, path, method) {
  const routeConfig = routes[path];
  if (!routeConfig) {
    return void 0;
  }
  const entry = routeConfig.methods[method];
  if (!isMethodConfigEntry(entry)) {
    return void 0;
  }
  return entry;
}

// src/core/call-route.ts
function isMutationMethod(method) {
  return method !== void 0 && method !== 'get';
}
async function executeCallRoute(routes, transport, route, options) {
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
async function runCallRoute(routes, transport, route, options) {
  return executeCallRoute(routes, transport, route, options);
}
function createRouteClient(config) {
  const { routes, transport } = config;
  const runCallRouteBound = (route, options) =>
    executeCallRoute(routes, transport, route, options);
  async function callRoute(route, options) {
    if (options === void 0) {
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
  const client = {
    callRoute,
    routes,
    runCallRoute: runCallRouteBound,
    transport,
  };
  return client;
}

// src/core/define-api-routes.ts
function defineApiRoutes(routes) {
  return routes;
}
function mergeApiRoutes(...routeGroups) {
  let merged = {};
  for (const group of routeGroups) {
    merged = { ...merged, ...group };
  }
  return merged;
}

// src/core/normalize-mutation-arg.ts
function isRouteParamsInput(value) {
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every(
    (entry) =>
      entry === void 0 ||
      typeof entry === 'string' ||
      typeof entry === 'number',
  );
}
function isExplicitMutationArg(value) {
  return (
    isRecord(value) && 'params' in value && isRouteParamsInput(value.params)
  );
}
function normalizeMutationArg(route, hookParams, methodConfig, arg) {
  if (hookParams) {
    const hasBodySchema2 = Boolean(methodConfig?.bodySchema);
    if (hasBodySchema2) {
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

// src/core/parse-transport-error.ts
function resolveApiError(methodConfig, err) {
  if (!isHttpTransportError(err) || !methodConfig?.errorSchema) {
    return err;
  }
  if (!hasErrorData(err)) {
    return err;
  }
  const parsed = parseErrorResponse(methodConfig.errorSchema, err.data);
  return parsed ?? err;
}
function invokeOnError(onError, methodConfig, err) {
  if (!onError) {
    return;
  }
  onError(resolveApiError(methodConfig, err));
}

export {
  HttpTransportError,
  areRouteParamsReady,
  assertRouteParamsReady,
  createRouteClient,
  defineApiRoutes,
  executeCallRoute,
  extractRouteParamNames,
  getMethodConfig,
  hasErrorData,
  hasRouteParams,
  invokeOnError,
  isHttpTransportError,
  isRecord,
  mergeApiRoutes,
  normalizeMutationArg,
  parseBody,
  parseBodyFromConfig,
  parseErrorResponse,
  parseResponse,
  parseResponseForMethod,
  parseRoute,
  resolveApiError,
  runCallRoute,
};
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
