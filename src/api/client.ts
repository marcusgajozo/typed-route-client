import { createFetchTransport } from '../lib/core/adapters/fetch-transport';
import { createRouteClient } from '../lib/core/call-route';
import { createReactQueryHooks } from '../lib/react/create-react-query-hooks';
import { fetchConfig } from '../libs/fetch-config';
import { apiRoutes } from '../services/api/api-routes';

export const routeClient = createRouteClient({
  routes: apiRoutes,
  transport: createFetchTransport(fetchConfig),
});

export const { useApiQuery, useApiMutation } =
  createReactQueryHooks(routeClient);
