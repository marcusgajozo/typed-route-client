import { act, renderHook, waitFor } from '@testing-library/react';

import { createRouteClient } from '../core/call-route';
import { createMockTransport, testRoutes } from '../core/test-utils';
import { createQueryClientWrapper } from './test-utils';
import { createUseApiMutation } from './use-api-mutation';

describe('use-api-mutation', () => {
  it('exposes bodySchema from route method config', () => {
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(jest.fn()),
    });
    const useApiMutation = createUseApiMutation(client);

    const { result } = renderHook(
      () =>
        useApiMutation('/users/:userId', {
          method: 'put',
        }),
      { wrapper: createQueryClientWrapper() },
    );

    expect(result.current.bodySchema).toBeDefined();
  });

  it('calls runCallRoute with normalized params and body', async () => {
    const runCallRoute = jest.fn().mockResolvedValue({ id: 1, name: 'Ana' });
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(jest.fn()),
    });
    client.runCallRoute = runCallRoute;

    const useApiMutation = createUseApiMutation(client);

    const { result } = renderHook(
      () =>
        useApiMutation('/users/:userId', {
          method: 'put',
        }),
      { wrapper: createQueryClientWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync({
        params: { userId: 1 },
        // @ts-expect-error BodyOf is not inferred from zod 4 schemas in the registry yet
        body: { name: 'Ana' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(runCallRoute).toHaveBeenCalledWith('/users/:userId', {
      method: 'put',
      body: { name: 'Ana' },
      queryParams: undefined,
      headers: undefined,
      params: { userId: 1 },
    });
    expect(result.current.data).toEqual({ id: 1, name: 'Ana' });
  });
});
