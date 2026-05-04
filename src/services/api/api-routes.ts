import { ZodType } from 'zod'

import { apiRoutesEndereco } from './endereco/apiRoutesEndereco'
import { apiRoutesSolicitacao } from './solicitacao/apiRoutesSolicitacao'
import { apiRoutesSolicitacaoMotivo } from './solicitacao-motivo/apiRoutesSolicitacaoMotivo'

const routes = [
  '/solicitacao-motivos',
  '/enderecos/:id',
  '/solicitacao/alterar-unidade-consumidora/:id',
] as const

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type ApiRoutes<T = unknown> = Record<
  (typeof routes)[number],
  {
    methods: Partial<
      Record<
        HttpMethod,
        {
          formSchema?: ZodType<T>
          responseSchema?: ZodType<T>
        }
      >
    >
  }
>

export const apiRoutes = {
  ...apiRoutesSolicitacaoMotivo,
  ...apiRoutesEndereco,
  ...apiRoutesSolicitacao,
} as const satisfies ApiRoutes
