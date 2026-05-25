# useRequest — Custom React Hook para APIs REST

Este repositório foi criado exclusivamente para demonstrar e documentar o hook customizado `useRequest`, desenvolvido para simplificar e padronizar chamadas a APIs REST em aplicações React com TypeScript.

---

## Sobre o hook

O `useRequest` é um hook que combina o poder do **TanStack Query** com o cliente HTTP **Axios**, oferecendo uma interface unificada para requisições GET (queries) e mutações (POST, PUT, PATCH, DELETE), com tipagem automática baseada em um contrato de rotas definido estaticamente.

Ele resolve de forma declarativa:

- inferência de tipos de payload e resposta por rota e método
- validação de schemas com **Zod**
- substituição de parâmetros dinâmicos na URL (ex: `:id`)
- controle de `autoFetch` e `queryKey` customizável
- exposição unificada de estados como `isLoading`, `data`, `refetch` e `mutate`

---

## Dependências

| Pacote                  | Versão | Função                                                               |
| ----------------------- | ------ | -------------------------------------------------------------------- |
| `@tanstack/react-query` | ^5     | Gerenciamento de estado assíncrono, cache e sincronização            |
| `axios`                 | ^1     | Cliente HTTP para realizar as requisições                            |
| `zod`                   | ^4     | Validação e inferência de tipos dos schemas de formulário e resposta |
| `react`                 | ^19    | Biblioteca base                                                      |
| `typescript`            | ~6     | Tipagem estática                                                     |

---

## Como funciona

### Contrato de rotas (`api-routes.ts`)

As rotas são registradas em um objeto `apiRoutes`, onde cada rota define os métodos HTTP disponíveis e seus schemas (formulário e resposta):

```ts
export const apiRoutes = {
  '/solicitacao-motivos': {
    methods: {
      get: { responseSchema: solicitacaoMotivoSchema },
      post: { formSchema: solicitacaoMotivoFormSchema },
    },
  },
  '/endereco/:id': {
    methods: {
      get: { responseSchema: enderecoSchema },
    },
  },
} satisfies ApiRoutes;
```

### Cliente HTTP (`httpClient.ts`)

O Axios é instanciado com a `baseURL` definida via variável de ambiente `VITE_BASE_URL`:

```ts
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const httpClient = instance;
```

### Uso do hook

**Query (GET com autoFetch):**

```tsx
const { data, isLoading, refetch } = useRequest({
  route: '/solicitacao-motivos',
  method: 'get',
  autoFetch: true,
});
```

**Query com parâmetro de rota:**

```tsx
const { data } = useRequest({
  route: '/endereco/:id',
  method: 'get',
  autoFetch: true,
  params: { id: 42 },
});
```

**Mutação (POST):**

```tsx
const { mutate, isLoading, formSchema } = useRequest({
  route: '/solicitacao-motivos',
  method: 'post',
});

mutate({ descricao: 'Novo motivo' });
```

O `formSchema` retornado é o schema Zod da rota/método, podendo ser usado diretamente com bibliotecas como `react-hook-form` + `@hookform/resolvers/zod`.

---

## Estrutura do projeto

```
src/
  hooks/
    use-request.ts          # Hook principal
  libs/
    httpClient.ts           # Instância do Axios
    queryClient.ts          # Configuração do QueryClient
  services/
    api/
      api-routes.ts         # Contrato central de rotas
      solicitacao/
        apiRoutesSolicitacao.ts
        schemas.ts
      solicitacao-motivo/
        apiRoutesSolicitacaoMotivo.ts
        schemas.ts
```

---

## Variáveis de ambiente

| Variável        | Descrição            |
| --------------- | -------------------- |
| `VITE_BASE_URL` | URL base da API REST |
