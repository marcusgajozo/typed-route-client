import { createApiClient } from '../lib/create-api-client';
import type { UseApiMutationHook } from '../lib/react/use-api-mutation';
import type { UseApiQueryHook } from '../lib/react/use-api-query';
import { appHttpTransport } from '../libs/http-transport';
import { apiRoutes } from '../services/api/api-routes';

const apiClient = createApiClient({
  routes: apiRoutes,
  transport: appHttpTransport,
});

export const routeClient = apiClient.routeClient;

type AppRoutes = typeof apiRoutes;

export const useApiQuery: UseApiQueryHook<AppRoutes> = apiClient.useApiQuery;
export const useApiMutation: UseApiMutationHook<AppRoutes> =
  apiClient.useApiMutation;
