import { z } from 'zod';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type ZodSchema = z.ZodType;
type MethodConfig = {
  bodySchema?: ZodSchema;
  responseSchema?: ZodSchema;
  errorSchema?: ZodSchema;
};
type RouteConfig = {
  methods: Partial<Record<HttpMethod, MethodConfig>>;
};
type ApiRegistry = Record<string, RouteConfig>;
type RouteRegistryBase = Record<
  string,
  {
    methods: Record<string, unknown>;
  }
>;
type MethodDef<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> = NonNullable<R[Path]['methods'][M]>;
type ResponseSchemaOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends {
    responseSchema: infer S extends z.ZodType;
  }
    ? S
    : never;
type BodySchemaOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends {
    bodySchema: infer S extends z.ZodType;
  }
    ? S
    : undefined;
type ResponseOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends {
    responseSchema: infer S extends z.ZodType;
  }
    ? z.output<S>
    : unknown;
type BodyOf<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = M extends keyof R[Path]['methods'] & HttpMethod
  ? MethodDef<R, Path, M> extends {
      bodySchema: infer S extends z.ZodType;
    }
    ? z.input<S>
    : undefined
  : never;
type ErrorOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends {
    errorSchema: infer S extends z.ZodType;
  }
    ? z.output<S>
    : unknown;
type HasPathParams<Path extends string> = Path extends `${string}:${string}`
  ? true
  : false;
type ExtractRouteParamNames<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param extends ''
      ? ExtractRouteParamNames<`/${Rest}`>
      : Param extends `${string}/${string}`
        ? never
        : [Param, ...ExtractRouteParamNames<`/${Rest}`>]
    : Path extends `${string}:${infer Param}`
      ? Param extends `${string}/${string}`
        ? never
        : [Param]
      : [];
type IsSinglePathParam<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly [string] ? true : false;
type SinglePathParamName<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly [infer Param]
    ? Param extends string
      ? Param
      : never
    : never;
type RouteParamsRecord = Record<string, string | number>;
type RouteParamName<Path extends string> = ExtractRouteParamNames<Path>[number];
type RouteParamsFromPath<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly []
    ? never
    : {
        [K in RouteParamName<Path>]: string | number | undefined;
      };
type QueryRouteParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? {
        params: RouteParamsFromPath<Path>;
      }
    : {
        params?: never;
      };
type CallRouteParamsProp<Path extends string> = QueryRouteParamsProp<Path>;
type RouteParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? {
        params: RouteParamsRecord;
      }
    : {
        params?: never;
      };
type MutationHookParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? {
        params?: RouteParamsFromPath<Path>;
      }
    : {
        params?: never;
      };
type MutationArgParamsOnly<Path extends string> = {
  params: RouteParamsFromPath<Path>;
};
type MutationArgParamsOptional<Path extends string> = {
  params?: RouteParamsFromPath<Path>;
};
type MutationArgParamsAndBody<
  Path extends string,
  R extends RouteRegistryBase,
  PathKey extends keyof R & string,
  M extends keyof R[PathKey]['methods'] & HttpMethod,
  ParamsRequired extends boolean,
> =
  BodyOf<R, PathKey, M> extends undefined
    ? ParamsRequired extends true
      ? {
          params: RouteParamsFromPath<Path>;
        }
      : {
          params?: RouteParamsFromPath<Path>;
        }
    : ParamsRequired extends true
      ? {
          params: RouteParamsFromPath<Path>;
          body: BodyOf<R, PathKey, M>;
        }
      : {
          params?: RouteParamsFromPath<Path>;
          body: BodyOf<R, PathKey, M>;
        };
type MutationArgExplicit<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = MutationArgParamsAndBody<Path, R, Path, M, true>;
type MutationArgWithHookParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> =
  BodyOf<R, Path, M> extends undefined
    ? MutationArgParamsOptional<Path> | undefined
    : MutationArgParamsAndBody<Path, R, Path, M, false>;
type HookProvidesRouteParams<
  Path extends string,
  HookOptions extends MutationHookParamsProp<Path>,
> = HookOptions extends {
  params: RouteParamsFromPath<Path>;
}
  ? true
  : false;
type MutationArgWithoutHookParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> =
  HasPathParams<Path> extends true
    ? BodyOf<R, Path, M> extends undefined
      ? MutationArgParamsOnly<Path>
      : MutationArgExplicit<R, Path, M>
    : BodyOf<R, Path, M> extends undefined
      ? undefined
      : BodyOf<R, Path, M>;
type MutationArg<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends MutationHookParamsProp<Path> & {
    method: M;
  },
> =
  HookProvidesRouteParams<Path, HookOptions> extends true
    ? MutationArgWithHookParams<R, Path, M>
    : MutationArgWithoutHookParams<R, Path, M>;
type PathsWithGet<R extends RouteRegistryBase> = {
  [P in keyof R & string]: 'get' extends keyof R[P]['methods'] ? P : never;
}[keyof R & string];
type PathsWithGetWithoutParams<R extends RouteRegistryBase> = {
  [P in PathsWithGet<R>]: HasPathParams<P> extends true ? never : P;
}[PathsWithGet<R>];
type PathsWithGetWithParams<R extends RouteRegistryBase> = {
  [P in PathsWithGet<R>]: HasPathParams<P> extends true ? P : never;
}[PathsWithGet<R>];
type PathsWithMethod<R extends RouteRegistryBase, M extends HttpMethod> = {
  [P in keyof R & string]: M extends keyof R[P]['methods'] ? P : never;
}[keyof R & string];
declare function getMethodConfig<R extends RouteRegistryBase>(
  routes: R,
  path: keyof R & string,
  method: HttpMethod,
): MethodConfig | undefined;
declare function getMethodDef<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(routes: R, path: Path, method: M): R[Path]['methods'][M] | undefined;
declare function getMethodDef(
  routes: RouteRegistryBase,
  path: string,
  method: HttpMethod,
): MethodConfig | undefined;

type HttpTransportRequest = {
  method: HttpMethod;
  url: string;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
};
type HttpTransportResponse = {
  data: unknown;
  status: number;
};
declare class HttpTransportError extends Error {
  readonly status?: number;
  readonly data?: unknown;
  readonly raw: unknown;
  constructor(options: {
    message?: string;
    status?: number;
    data?: unknown;
    raw: unknown;
  });
}
type HttpTransport = {
  request(req: HttpTransportRequest): Promise<HttpTransportResponse>;
};

declare function parseRoute(
  route: string,
  params?: Record<string, string | number>,
): string;
declare function extractRouteParamNames(route: string): string[];
declare function hasRouteParams(route: string): boolean;
type RouteParamsInput = Record<string, string | number | undefined>;
declare function areRouteParamsReady(
  route: string,
  params: RouteParamsInput | undefined,
): boolean;
declare function assertRouteParamsReady(
  route: string,
  params: RouteParamsInput | undefined,
): asserts params is Record<string, string | number>;

type RunCallRouteOptionsForPath<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = {
  method: M;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
} & (HasPathParams<Path> extends true
  ? {
      params: {
        [K in RouteParamName<Path>]: string | number;
      };
    }
  : {
      params?: never;
    }) &
  (BodyOf<R, Path, M> extends undefined
    ? {
        body?: never;
      }
    : {
        body: BodyOf<R, Path, M>;
      });
type CallRouteParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = RunCallRouteOptionsForPath<R, Path, M>;
type CallRouteGetOptionsWithoutParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithoutParams<R>,
> = Omit<CallRouteParams<R, Path, 'get'>, 'method' | 'params'> & {
  method?: 'get';
};
type CallRouteGetOptionsWithParams<
  R extends RouteRegistryBase,
  Path extends PathsWithGetWithParams<R>,
> = Omit<CallRouteParams<R, Path, 'get'>, 'method' | 'params'> & {
  method?: 'get';
} & QueryRouteParamsProp<Path>;
type CallRouteGetOptionsForPath<
  R extends RouteRegistryBase,
  Path extends PathsWithGet<R>,
> = Omit<CallRouteParams<R, Path, 'get'>, 'method' | 'params'> & {
  method?: 'get';
} & (HasPathParams<Path> extends true
    ? QueryRouteParamsProp<Path>
    : {
        params?: never;
      });
type RunCallRouteOptionsLoose<M extends HttpMethod = HttpMethod> = {
  method: M;
  body?: unknown;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: RouteParamsInput;
};
type RouteClient<R extends RouteRegistryBase> = {
  callRoute<
    Path extends keyof R & string,
    const M extends keyof R[Path]['methods'] & HttpMethod,
  >(
    route: Path,
    options: CallRouteParams<R, Path, M>,
  ): Promise<ResponseOf<R, Path, M>>;
  callRoute<Path extends PathsWithGet<R>>(
    route: Path,
    ...args: HasPathParams<Path> extends true
      ? [options: CallRouteGetOptionsForPath<R, Path>]
      : [options?: CallRouteGetOptionsForPath<R, Path>]
  ): Promise<ResponseOf<R, Path, 'get'>>;
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
declare function executeCallRoute<
  R extends RouteRegistryBase,
  const Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsLoose<M>,
): Promise<ResponseOf<R, Path, M>>;
declare function executeCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsLoose<M>,
): Promise<ResponseOf<R, Path, M>>;
declare function runCallRoute<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(
  routes: R,
  transport: HttpTransport,
  route: Path,
  options: RunCallRouteOptionsForPath<R, Path, M>,
): Promise<ResponseOf<R, Path, M>>;
declare function createRouteClient<const R extends RouteRegistryBase>(config: {
  routes: R;
  transport: HttpTransport;
}): RouteClient<R>;

declare function defineApiRoutes<const T extends Record<string, RouteConfig>>(
  routes: T,
): T;
type MergeRouteGroups<T extends readonly Record<string, RouteConfig>[]> =
  T extends readonly [
    infer First extends Record<string, RouteConfig>,
    ...infer Rest extends readonly Record<string, RouteConfig>[],
  ]
    ? Rest extends readonly []
      ? First
      : First & MergeRouteGroups<Rest>
    : never;
declare function mergeApiRoutes<
  const T extends readonly [
    Record<string, RouteConfig>,
    ...Record<string, RouteConfig>[],
  ],
>(...routeGroups: T): MergeRouteGroups<T>;

declare function isRecord(value: unknown): value is Record<string, unknown>;
declare function isHttpTransportError(
  value: unknown,
): value is HttpTransportError;
declare function hasErrorData(
  err: HttpTransportError,
): err is HttpTransportError & {
  data: unknown;
};

type NormalizedMutationArg = {
  params?: RouteParamsInput;
  body?: unknown;
};
declare function normalizeMutationArg(
  route: string,
  hookParams: RouteParamsInput | undefined,
  methodConfig: MethodConfig | undefined,
  arg: unknown,
): NormalizedMutationArg;

declare function parseResponse<Output>(
  schema: z.ZodType<Output>,
  data: unknown,
): Output;
declare function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.output<T>;
declare function parseErrorResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.output<T> | undefined;
declare function parseBodyFromConfig(
  methodConfig: MethodConfig | undefined,
  body: unknown,
): unknown;
declare function parseResponseForMethod<
  const R extends RouteRegistryBase,
  const Path extends keyof R & string,
  const M extends keyof R[Path]['methods'] & HttpMethod,
>(routes: R, route: Path, method: M, data: unknown): ResponseOf<R, Path, M>;
declare function parseResponseForMethod(
  routes: unknown,
  route: unknown,
  method: unknown,
  data: unknown,
): unknown;

declare function resolveApiError(
  methodConfig: MethodConfig | undefined,
  err: unknown,
): unknown;
type OnErrorCallback<TError> = [TError] extends [never]
  ? (err: unknown) => void
  : (err: TError | Error | HttpTransportError) => void;
declare function invokeOnError(
  onError: ((err: unknown) => void) | undefined,
  methodConfig: MethodConfig | undefined,
  err: unknown,
): void;

export {
  type ApiRegistry,
  type BodyOf,
  type BodySchemaOf,
  type CallRouteGetOptionsForPath,
  type CallRouteGetOptionsWithParams,
  type CallRouteGetOptionsWithoutParams,
  type CallRouteParams,
  type CallRouteParamsProp,
  type ErrorOf,
  type ExtractRouteParamNames,
  type HasPathParams,
  type HookProvidesRouteParams,
  type HttpMethod,
  type HttpTransport,
  HttpTransportError,
  type HttpTransportRequest,
  type HttpTransportResponse,
  type IsSinglePathParam,
  type MethodConfig,
  type MethodDef,
  type MutationArg,
  type MutationArgExplicit,
  type MutationArgParamsAndBody,
  type MutationArgParamsOnly,
  type MutationArgParamsOptional,
  type MutationArgWithHookParams,
  type MutationArgWithoutHookParams,
  type MutationHookParamsProp,
  type NormalizedMutationArg,
  type OnErrorCallback,
  type PathsWithGet,
  type PathsWithGetWithParams,
  type PathsWithGetWithoutParams,
  type PathsWithMethod,
  type QueryRouteParamsProp,
  type ResponseOf,
  type ResponseSchemaOf,
  type RouteClient,
  type RouteConfig,
  type RouteParamName,
  type RouteParamsFromPath,
  type RouteParamsInput,
  type RouteParamsProp,
  type RouteParamsRecord,
  type RouteRegistryBase,
  type RunCallRouteOptionsForPath,
  type RunCallRouteOptionsLoose,
  type SinglePathParamName,
  type ZodSchema,
  areRouteParamsReady,
  assertRouteParamsReady,
  createRouteClient,
  defineApiRoutes,
  executeCallRoute,
  extractRouteParamNames,
  getMethodConfig,
  getMethodDef,
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
