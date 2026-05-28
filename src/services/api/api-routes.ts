import {
  defineApiRoutes,
  mergeApiRoutes,
} from '../../lib/core/define-api-routes';
import { apiRoutesUser } from './users/api-routes-user';

export { defineApiRoutes, mergeApiRoutes };

export const apiRoutes = mergeApiRoutes(apiRoutesUser);
