import type { z } from 'zod';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type ZodSchema = z.ZodType;

export type MethodConfig = {
  bodySchema?: ZodSchema;
  responseSchema?: ZodSchema;
  errorSchema?: ZodSchema;
};

export type RouteConfig = {
  methods: Partial<Record<HttpMethod, MethodConfig>>;
};

export type ApiRegistry = Record<string, RouteConfig>;

export type RouteRegistryBase = Record<
  string,
  {
    methods: Record<string, unknown>;
  }
>;

export type MethodDef<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> = NonNullable<R[Path]['methods'][M]>;

export type ResponseSchemaOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { responseSchema: infer S }
    ? S extends z.ZodType
      ? S
      : never
    : never;

export type BodySchemaOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { bodySchema: infer S }
    ? S extends z.ZodType
      ? S
      : undefined
    : undefined;

export type ResponseOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { responseSchema: infer S }
    ? S extends z.ZodType
      ? z.output<S>
      : unknown
    : unknown;

export type BodyOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { bodySchema: infer S }
    ? S extends z.ZodType
      ? z.input<S>
      : undefined
    : undefined;

export type ErrorOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { errorSchema: infer S }
    ? S extends z.ZodType
      ? z.output<S>
      : unknown
    : unknown;

export type HasPathParams<Path extends string> =
  Path extends `${string}:${string}` ? true : false;

export type ExtractRouteParamNames<Path extends string> =
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

export type IsSinglePathParam<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly [string] ? true : false;

export type SinglePathParamName<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly [infer Param]
    ? Param extends string
      ? Param
      : never
    : never;

export type RouteParamsRecord = Record<string, string | number>;

export type RouteParamName<Path extends string> =
  ExtractRouteParamNames<Path>[number];

export type RouteParamsFromPath<Path extends string> =
  ExtractRouteParamNames<Path> extends readonly []
    ? never
    : {
        [K in RouteParamName<Path>]: string | number | undefined;
      };

export type QueryRouteParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? { params: RouteParamsFromPath<Path> }
    : { params?: never };

export type CallRouteParamsProp<Path extends string> =
  QueryRouteParamsProp<Path>;

export type RouteParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? { params: RouteParamsRecord }
    : { params?: never };

export type MutationHookParamsProp<Path extends string> =
  HasPathParams<Path> extends true
    ? { params?: RouteParamsFromPath<Path> }
    : { params?: never };

export type MutationArgExplicit<Path extends string> = {
  params: RouteParamsFromPath<Path>;
  body?: unknown;
};

export type HookProvidesRouteParams<
  Path extends string,
  HookOptions extends MutationHookParamsProp<Path>,
> = HookOptions extends { params: RouteParamsFromPath<Path> } ? true : false;

export type MutationArgMixed<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> =
  SinglePathParamName<Path> extends infer Param
    ? Param extends string
      ? { [K in Param]: string | number } & NonNullable<BodyOf<R, Path, M>>
      : never
    : never;

export type MutationArg<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends MutationHookParamsProp<Path> & { method: M },
> =
  HookProvidesRouteParams<Path, HookOptions> extends true
    ? NonNullable<BodyOf<R, Path, M>> extends never
      ? undefined
      : BodyOf<R, Path, M>
    : HasPathParams<Path> extends true
      ? NonNullable<BodyOf<R, Path, M>> extends never
        ? IsSinglePathParam<Path> extends true
          ? string | number | RouteParamsFromPath<Path>
          : RouteParamsFromPath<Path>
        : IsSinglePathParam<Path> extends true
          ? MutationArgMixed<R, Path, M> | MutationArgExplicit<Path>
          : MutationArgExplicit<Path>
      : NonNullable<BodyOf<R, Path, M>> extends never
        ? undefined
        : BodyOf<R, Path, M>;

export type PathsWithGet<R extends RouteRegistryBase> = {
  [P in keyof R & string]: 'get' extends keyof R[P]['methods'] ? P : never;
}[keyof R & string];

export type PathsWithGetWithoutParams<R extends RouteRegistryBase> = {
  [P in PathsWithGet<R>]: HasPathParams<P> extends true ? never : P;
}[PathsWithGet<R>];

export type PathsWithGetWithParams<R extends RouteRegistryBase> = {
  [P in PathsWithGet<R>]: HasPathParams<P> extends true ? P : never;
}[PathsWithGet<R>];

export type PathsWithMethod<
  R extends RouteRegistryBase,
  M extends HttpMethod,
> = {
  [P in keyof R & string]: M extends keyof R[P]['methods'] ? P : never;
}[keyof R & string];

function isMethodConfigEntry(value: unknown): value is MethodConfig {
  return typeof value === 'object' && value !== null;
}

export function getMethodConfig<R extends RouteRegistryBase>(
  routes: R,
  path: keyof R & string,
  method: HttpMethod,
): MethodConfig | undefined {
  const routeConfig = routes[path];
  if (!routeConfig) {
    return undefined;
  }

  const entry = routeConfig.methods[method];
  if (!isMethodConfigEntry(entry)) {
    return undefined;
  }

  return entry;
}

export function getMethodDef<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(routes: R, path: Path, method: M): R[Path]['methods'][M] | undefined;

export function getMethodDef(
  routes: RouteRegistryBase,
  path: string,
  method: HttpMethod,
): MethodConfig | undefined;

export function getMethodDef(
  routes: RouteRegistryBase,
  path: string,
  method: HttpMethod,
): MethodConfig | undefined {
  return getMethodConfig(routes, path, method);
}
