import { updateUnidadeConsumidoraSchema } from './schemas';

export const apiRoutesSolicitacao = {
  '/solicitacao/alterar-unidade-consumidora/:id': {
    methods: {
      patch: {
        bodySchema: updateUnidadeConsumidoraSchema,
      },
    },
  },
} as const;
