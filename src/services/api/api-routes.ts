import { apiRoutesUser } from './users/api-routes-user';

export type {
  ApiRegistry,
  HttpMethod,
  MethodConfig,
  RouteConfig,
} from '../../lib/core/types';

export { defineApiRoutes } from '../../lib/core/define-api-routes';

export const apiRoutes = {
  ...apiRoutesUser,
} as const;
