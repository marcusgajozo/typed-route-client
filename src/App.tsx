import { useApiMutation, useApiQuery } from './api/client';

export function App() {
  const { data, isLoading } = useApiQuery('/solicitacao-motivos/:motivosids', {
    params: { motivosids: '123' },
  });

  const { mutate: updateUnidade, isPending: isUpdating } = useApiMutation(
    '/solicitacao/alterar-unidade-consumidora/:id',
    { method: 'patch', params: { id: 123 } },
  );

  const { mutate: deleteCurso, isPending: isDeleting } = useApiMutation(
    '/cursos/:id',
    { method: 'delete' },
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
          updateUnidade({ unidade_consumidora: '10/12345678' });
        }}
      >
        {isUpdating ? 'Salvando...' : 'Alterar unidade consumidora'}
      </button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => {
          deleteCurso({ id: 42 });
        }}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir curso (id: 42)'}
      </button>
    </div>
  );
}
