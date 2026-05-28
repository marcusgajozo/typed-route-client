# typed-route-client

Biblioteca TypeScript para APIs REST com **rotas tipadas + Zod**, transporte HTTP plugável e hooks React opcionais (TanStack Query v5).

A lib **não** inclui adapter HTTP (fetch, axios, etc.). Você implementa `HttpTransport` no app.

---

## Instalação

### GitHub (recomendado por enquanto)

```bash
pnpm add github:marcusgajozo/typed-route-client#v0.1.0
```

Se o repositório ainda se chamar `react-hook-use-request`:

```bash
pnpm add github:marcusgajozo/react-hook-use-request#v0.1.0
```

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
| `HttpTransport`, `HttpTransportError`                  | Contrato de transporte                       |
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
pnpm run build   # gera dist/ (commitado para install via GitHub)
pnpm lint:fix
```

Release: `pnpm build` → commit `dist/` → tag `v0.1.0`.

---

## Licença

Ver [LICENSE](LICENSE).
