import { useApiMutation, useApiQuery } from './api/client';

export function App() {
  const { data, isLoading } = useApiQuery('/solicitacao-motivos');

  const { mutate: updateUnidade, isPending: isUpdating } = useApiMutation(
    '/solicitacao/alterar-unidade-consumidora/:id',
    { method: 'patch', params: { id: 2123 } },
  );

  const { mutate: deleteCurso, isPending: isDeleting } = useApiMutation(
    '/solicitacao/alterar-unidade-consumidora/:id',
    { method: 'patch' },
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
          deleteCurso({ params: {} });
        }}
      >
        {isDeleting ? 'Excluindo...' : 'Excluir curso (id: 42)'}
      </button>
    </div>
  );
}
