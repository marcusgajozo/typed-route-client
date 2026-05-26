import { defineApiRoutes } from '../../../lib/core/define-api-routes';
import { getSolicitacaoMotivoSchema } from './schemas';

export const apiRoutesSolicitacaoMotivo = defineApiRoutes({
  '/solicitacao-motivos/:motivosids': {
    methods: {
      get: {
        responseSchema: getSolicitacaoMotivoSchema,
      },
    },
  },
});
