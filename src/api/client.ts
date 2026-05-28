import { createRouteClient } from '../lib/core/call-route';
import { createReactQueryHooks } from '../lib/react/create-react-query-hooks';
import { appHttpTransport } from '../libs/http-transport';
import { apiRoutes } from '../services/api/api-routes';

export const routeClient = createRouteClient({
  routes: apiRoutes,
  transport: appHttpTransport,
});

export const { useApiQuery, useApiMutation } =
  createReactQueryHooks(routeClient);
