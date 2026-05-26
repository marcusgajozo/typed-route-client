import { useApiMutation, useApiQuery } from './api/client';

export function App() {
  const { data, isLoading } = useApiQuery('/users');
  const { mutate: updateUser, isPending: isUpdating } = useApiMutation(
    '/users/:userId',
    { method: 'put' },
  );

  return (
    <div>
      <h1>useRequest — fetch + TanStack Query</h1>
      {isLoading ? (
        <p>Carregando motivos...</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => {
          updateUser({
            body: {
              id: 1,
              email: 'teste@teste.com',
              password: '123456',
              username: 'teste',
            },
            params: { userId: '1' },
          });
        }}
      >
        {isUpdating ? 'Salvando...' : 'Alterar usuário'}
      </button>
    </div>
  );
}
