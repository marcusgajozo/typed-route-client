import { ApiRoutes } from '../apiRoutes'
import { updateUnidadeConsumidoraSchema } from './schemas'

export const apiRoutesSolicitacao = {
  '/solicitacao/alterar-unidade-consumidora/:id': {
    methods: {
      patch: {
        formSchema: updateUnidadeConsumidoraSchema,
      },
    },
  },
} as const satisfies Partial<ApiRoutes>
