import { mergeApiRoutes } from '../../lib/core/define-api-routes';
import { apiRoutesUser } from './users/api-routes-user';

export const apiRoutes = mergeApiRoutes(apiRoutesUser);
