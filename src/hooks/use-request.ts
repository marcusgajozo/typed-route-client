import { useMutation, useQuery } from "@tanstack/react-query";

import { httpClient } from "@/libs/httpClient";
import { apiRoutes } from "@/services/api/apiRoutes";

type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string | number } & ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string | number }
      : never;

type RouteParamsProp<R extends string> =
  ExtractRouteParams<R> extends never
    ? { params?: never }
    : { params: ExtractRouteParams<R> };

interface MethodConfig {
  responseSchema?: { parse: (data: unknown) => unknown };
  formSchema?: { parse: (data: unknown) => unknown };
}

type HttpMethod = keyof (typeof apiRoutes)[keyof typeof apiRoutes]["methods"];

type UseRequestProps<
  R extends keyof typeof apiRoutes,
  M extends keyof (typeof apiRoutes)[R]["methods"],
> = {
  route: R;
  method: M & HttpMethod;
  autoFetch?: boolean;
  queryKey?: string | unknown[];
} & RouteParamsProp<R extends string ? R : string>;

function callHttpMethod(method: HttpMethod, url: string, payload?: unknown) {
  switch (method) {
    case "get":
      return httpClient.get(url);
    case "post":
      return httpClient.post(url, payload);
    case "put":
      return httpClient.put(url, payload);
    case "patch":
      return httpClient.patch(url, payload);
    case "delete":
      return httpClient.delete(url);
  }
}

export function useRequest<
  R extends keyof typeof apiRoutes,
  M extends keyof (typeof apiRoutes)[R]["methods"],
>(props: UseRequestProps<R, M>) {
  const { route, method, autoFetch = false, queryKey, params } = props as any;

  const routeConfig = apiRoutes[route as keyof typeof apiRoutes] as {
    methods: Record<string, MethodConfig>;
  };
  const methodConfig = routeConfig.methods[method]; // method is 'any', but routeConfig is safely typed
  const httpMethod = method as HttpMethod;

  const parsedRoute = params
    ? Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
        route as string,
      )
    : (route as string);

  const defaultQueryKey = params ? [route, params] : [route];
  const finalQueryKey = queryKey
    ? Array.isArray(queryKey)
      ? queryKey
      : [queryKey]
    : defaultQueryKey;

  const { data, isLoading, refetch } = useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      const response = await callHttpMethod(httpMethod, parsedRoute);
      return response?.data;
    },
    select: (data: unknown) =>
      methodConfig?.responseSchema?.parse(data) ?? data,
    enabled: autoFetch,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await callHttpMethod(httpMethod, parsedRoute, payload);
      return response?.data;
    },
  });

  return {
    data,
    isLoading: isLoading || isPending,
    refetch,
    mutate,
    formSchema: methodConfig?.formSchema,
  };
}
