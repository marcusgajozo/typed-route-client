import { defineApiRoutes } from '../../../lib/core/define-api-routes';
import { updateUnidadeConsumidoraSchema } from './schemas';

export const apiRoutesSolicitacao = defineApiRoutes({
  '/solicitacao/alterar-unidade-consumidora/:id': {
    methods: {
      patch: {
        bodySchema: updateUnidadeConsumidoraSchema,
      },
    },
  },
});
