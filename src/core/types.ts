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

export type RouteRegistryBase = Record<string, RouteConfig>;

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
  MethodDef<R, Path, M> extends { responseSchema: infer S extends z.ZodType }
    ? S
    : never;

export type BodySchemaFromMethodDef<T> =
  | (T extends undefined
      ? never
      : NonNullable<T> extends { bodySchema: infer S extends z.ZodType }
        ? S
        : never)
  | undefined;

export type BodySchemaOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> = BodySchemaFromMethodDef<R[Path]['methods'][M]>;

export type ResponseOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { responseSchema: infer S extends z.ZodType }
    ? z.output<S>
    : unknown;

export type BodyOf<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = M extends keyof R[Path]['methods'] & HttpMethod
  ? MethodDef<R, Path, M> extends { bodySchema: infer S extends z.ZodType }
    ? z.input<S>
    : undefined
  : never;

export type ErrorOf<
  R extends RouteRegistryBase,
  Path extends keyof R,
  M extends keyof R[Path]['methods'],
> =
  MethodDef<R, Path, M> extends { errorSchema: infer S extends z.ZodType }
    ? z.output<S>
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

export type MutationArgParamsOnly<Path extends string> = {
  params: RouteParamsFromPath<Path>;
};

export type MutationArgParamsOptional<Path extends string> = {
  params?: RouteParamsFromPath<Path>;
};

export type MutationArgParamsAndBody<
  Path extends string,
  R extends RouteRegistryBase,
  PathKey extends keyof R & string,
  M extends keyof R[PathKey]['methods'] & HttpMethod,
  ParamsRequired extends boolean,
> =
  BodyOf<R, PathKey, M> extends undefined
    ? ParamsRequired extends true
      ? { params: RouteParamsFromPath<Path> }
      : { params?: RouteParamsFromPath<Path> }
    : ParamsRequired extends true
      ? {
          params: RouteParamsFromPath<Path>;
          body: BodyOf<R, PathKey, M>;
        }
      : {
          params?: RouteParamsFromPath<Path>;
          body: BodyOf<R, PathKey, M>;
        };

export type MutationArgExplicit<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> = MutationArgParamsAndBody<Path, R, Path, M, true>;

export type MutationArgWithHookParams<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
> =
  BodyOf<R, Path, M> extends undefined
    ? MutationArgParamsOptional<Path> | undefined
    : MutationArgParamsAndBody<Path, R, Path, M, false>;

export type HookProvidesRouteParams<
  Path extends string,
  HookOptions extends MutationHookParamsProp<Path>,
> = HookOptions extends { params: RouteParamsFromPath<Path> } ? true : false;

export type MutationArgWithoutHookParams<
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

export type MutationArg<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
  HookOptions extends MutationHookParamsProp<Path> & { method: M },
> =
  HookProvidesRouteParams<Path, HookOptions> extends true
    ? MutationArgWithHookParams<R, Path, M>
    : MutationArgWithoutHookParams<R, Path, M>;

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

export function getMethodConfig<
  R extends RouteRegistryBase,
  Path extends keyof R & string,
  M extends keyof R[Path]['methods'] & HttpMethod,
>(routes: R, path: Path, method: M): R[Path]['methods'][M] | undefined;

export function getMethodConfig<R extends RouteRegistryBase>(
  routes: R,
  path: keyof R & string,
  method: HttpMethod,
): MethodConfig | undefined;

export function getMethodConfig(
  routes: RouteRegistryBase,
  path: string,
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

function isMethodConfigObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function methodDefHasBodySchema<T>(methodDef: T): methodDef is T & {
  bodySchema: NonNullable<BodySchemaFromMethodDef<T>>;
} {
  return (
    isMethodConfigObject(methodDef) &&
    'bodySchema' in methodDef &&
    methodDef.bodySchema !== undefined
  );
}

export function hasMethodBodySchema<T>(methodDef: T): methodDef is T & {
  bodySchema: NonNullable<BodySchemaFromMethodDef<T>>;
} {
  return methodDefHasBodySchema(methodDef);
}

export function readBodySchema<T extends MethodConfig | undefined>(
  methodDef: T,
): BodySchemaFromMethodDef<T> {
  if (methodDefHasBodySchema(methodDef)) {
    return methodDef.bodySchema;
  }

  return undefined;
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
