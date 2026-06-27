# typed-route-client

Biblioteca TypeScript para APIs REST com **rotas tipadas + Zod**, transporte HTTP plugável e hooks React opcionais (TanStack Query v5).

A lib **não** inclui adapter HTTP (fetch, axios, etc.). Você implementa `HttpTransport` no app.

---

## Instalação

### npm (em breve)

```bash
pnpm add typed-route-client
```

### Dependências (peers)

| Subpath  | Instalar no app                                     |
| -------- | --------------------------------------------------- |
| `/core`  | `zod`                                               |
| `/react` | `zod`, `react` (>=18), `@tanstack/react-query` (^5) |

---

## Entry points

| Import                     | Uso                                              |
| -------------------------- | ------------------------------------------------ |
| `typed-route-client/core`  | Headless: rotas, cliente, validação Zod          |
| `typed-route-client/react` | Hooks `useApiQuery` / `useApiMutation` + atalhos |

Não há export na raiz do pacote — escolha `/core` ou `/react` explicitamente.

---

## Core (sem React)

```ts
import {
  defineApiRoutes,
  createRouteClient,
  type HttpTransport,
  type HttpTransportRequest,
  type HttpTransportResponse,
} from 'typed-route-client/core';
import { z } from 'zod';

const routes = defineApiRoutes({
  '/users': {
    methods: {
      get: {
        responseSchema: z.array(z.object({ id: z.number(), name: z.string() })),
      },
    },
  },
});

const transport: HttpTransport = {
  async request(req: HttpTransportRequest): Promise<HttpTransportResponse> {
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    return {
      status: res.status,
      data: await res.json(),
    };
  },
};

const client = createRouteClient({ routes, transport });

const users = await client.callRoute('/users');
```

### Contexto customizado no transport

Use o genérico `TContext` em `HttpTransportRequest<TContext>` e `HttpTransport<TContext>` para passar metadados da chamada até a função `request` — por exemplo, controlar toast, loading global ou retry silencioso.

```ts
import {
  createRouteClient,
  defineApiRoutes,
  type CallRouteDispatchOptions,
  type HttpTransport,
  type HttpTransportRequest,
} from 'typed-route-client/core';
import { z } from 'zod';

type RequestContext = {
  showToast: boolean;
  silent?: boolean;
};

const routes = defineApiRoutes({
  '/users': {
    methods: {
      get: {
        responseSchema: z.array(z.object({ id: z.number(), name: z.string() })),
      },
    },
  },
  '/users/:id': {
    methods: {
      put: {
        bodySchema: z.object({ name: z.string() }),
        responseSchema: z.object({ id: z.number(), name: z.string() }),
      },
    },
  },
});

const transport: HttpTransport<RequestContext> = {
  async request(req: HttpTransportRequest<RequestContext>) {
    if (req.context?.showToast) {
      // ex.: toast.info('Enviando requisição…')
    }

    const res = await fetch(req.url, { method: req.method });
    return { status: res.status, data: await res.json() };
  },
};

const client = createRouteClient({ routes, transport });

// GET com contexto
await client.callRoute('/users', {
  context: { showToast: true },
});

// Mutation com contexto
await client.callRoute('/users/:id', {
  method: 'put',
  params: { id: 1 },
  body: { name: 'Ana' },
  context: { showToast: false, silent: true },
});

// runCallRoute também aceita context
await client.runCallRoute('/users', {
  method: 'get',
  context: { showToast: true },
});
```

O tipo de `context` é inferido a partir do transport. Com `HttpTransport<RequestContext>`, `callRoute` e `runCallRoute` exigem o shape correto em `context`. Sem o genérico (`HttpTransport`), `context` não é permitido nas opções.

O tipo `CallRouteDispatchOptions<TContext>` descreve as opções aceitas por `callRoute` (incluindo `context`) e pode ser reutilizado no app quando necessário.

---

## React + TanStack Query

```ts
import { defineApiRoutes } from 'typed-route-client/core';
import { createApiClient } from 'typed-route-client/react';
import { z } from 'zod';

const routes = defineApiRoutes({
  '/users': {
    methods: {
      get: {
        responseSchema: z.array(z.object({ id: z.number(), name: z.string() })),
      },
    },
  },
});

const { useApiQuery, useApiMutation } = createApiClient({
  routes,
  transport: myTransport,
});

function UserList() {
  const { data, isLoading } = useApiQuery('/users');
  // ...
}
```

Alternativa com factories separadas:

```ts
import { createRouteClient } from 'typed-route-client/core';
import { createReactQueryHooks } from 'typed-route-client/react';

const routeClient = createRouteClient({ routes, transport });
const { useApiQuery, useApiMutation } = createReactQueryHooks(routeClient);
```

---

## API principal

### Core (`typed-route-client/core`)

| Export                                                 | Descrição                                    |
| ------------------------------------------------------ | -------------------------------------------- |
| `defineApiRoutes`, `mergeApiRoutes`                    | Contrato de rotas com literais de path       |
| `createRouteClient`                                    | Cliente tipado (`callRoute`, `runCallRoute`) |
| `runCallRoute`, `executeCallRoute`                     | Chamadas com método explícito                |
| `HttpTransport`, `HttpTransportRequest`, `HttpTransportError` | Contrato de transporte (com genérico `TContext` opcional) |
| `CallRouteDispatchOptions`                             | Opções de `callRoute`, incluindo `context`   |
| `parseRoute`, `areRouteParamsReady`, `resolveApiError` | Utilitários                                  |

### React (`typed-route-client/react`)

| Export                    | Descrição                                    |
| ------------------------- | -------------------------------------------- |
| `createApiClient`         | `routeClient` + hooks tipados                |
| `createReactQueryHooks`   | Hooks a partir de um `routeClient` existente |
| `createUseApiQuery`       | Factory de hook de query                     |
| `createUseApiMutation`    | Factory de hook de mutation                  |
| `RouteRegistryFromClient` | Extrai o registry de `typeof routeClient`    |

---

## Desenvolvimento

```bash
pnpm install
pnpm test
pnpm run build   # gera dist/ localmente (não versionado no git)
pnpm lint:fix
```

Release automático no push para `main` (GitHub Actions): lint, test, build e publicação no npm via semantic-release.

---

## Licença

Ver [LICENSE](LICENSE).
