import { useTransition } from 'react';

import { routeClient, useApiMutation, useApiQuery } from './api/client';

export function App() {
  const [isPending, startTransition] = useTransition();

  const { data, isLoading } = useApiQuery('/users');

  const { mutate: updateUser, isPending: isUpdating } = useApiMutation(
    '/users/:userId',
    { method: 'put' },
  );

  const handleGetUsers = () => {
    startTransition(async () => {
      const users = await routeClient.callRoute('/users');
      console.log(users);
    });
  };

  const handleUpdateUser = () => {
    startTransition(async () => {
      const updated = await routeClient.callRoute('/users/:userId', {
        method: 'put',
        params: { userId: 1 },
        body: {
          id: 1,
          username: 'ana',
          email: 'ana@example.com',
          password: 'secret',
        },
      });
      console.log(updated);
    });
  };

  return (
    <div>
      <h2>useRequest — fetch + TanStack Query</h2>
      {isLoading ? (
        <p>Carregando usuários...</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
      <h2>useRequest — routeClient.callRoute</h2>
      {isPending && <p>Carregando...</p>}
      <button type="button" disabled={isPending} onClick={handleGetUsers}>
        GET /users
      </button>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => {
          updateUser({
            params: { userId: 1 },
            body: {
              id: 1,
              username: 'ana',
              email: 'ana@example.com',
              password: 'secret',
            },
          });
        }}
      >
        PUT /users/:userId (hook)
      </button>
      <button type="button" disabled={isPending} onClick={handleUpdateUser}>
        PUT /users/:userId (callRoute)
      </button>
    </div>
  );
}
