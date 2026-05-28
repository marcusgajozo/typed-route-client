import { useApiMutation } from './api/client';

/**
 * Espelha o fluxo de App.tsx: hook exportado + mutate com body.
 * Compilado com tsconfig.app (mesmo projeto que App.tsx).
 */
describe('App.tsx mutation inference', () => {
  it('updateUser mutate requires body from bodySchema', () => {
    function TypeCheckAppFlow() {
      const { mutate: updateUser } = useApiMutation('/users/:userId', {
        method: 'put',
      });

      updateUser({
        params: { userId: 1 },
        body: {
          id: 1,
          username: 'ana',
          email: 'ana@example.com',
          password: 'secret',
        },
      });
    }

    function TypeCheckAppFlowEmptyBody() {
      const { mutate: updateUser } = useApiMutation('/users/:userId', {
        method: 'put',
      });

      updateUser({
        params: { userId: 1 },
        // @ts-expect-error body must match bodySchema
        body: {},
      });
    }

    expect(TypeCheckAppFlow).toBeDefined();
    expect(TypeCheckAppFlowEmptyBody).toBeDefined();
  });
});
