import { apiRoutesCursos } from './cursos/apiRoutesCursos';
import { apiRoutesSolicitacao } from './solicitacao/apiRoutesSolicitacao';
import { apiRoutesSolicitacaoMotivo } from './solicitacao-motivo/apiRoutesSolicitacaoMotivo';

export type {
  ApiRegistry,
  HttpMethod,
  MethodConfig,
  RouteConfig,
} from '../../lib/core/types';

export const apiRoutes = {
  ...apiRoutesSolicitacaoMotivo,
  ...apiRoutesSolicitacao,
  ...apiRoutesCursos,
} as const;
