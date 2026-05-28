import { act, renderHook, waitFor } from '@testing-library/react';

import { createRouteClient } from '../core/call-route';
import { createMockTransport, testRoutes } from '../test/core-utils';
import { createQueryClientWrapper } from '../test/react-utils';
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

  it('calls transport with normalized params and body', async () => {
    const request = jest.fn().mockResolvedValue({
      data: { id: 1, name: 'Ana' },
      status: 200,
    });
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(request),
    });
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
        body: { name: 'Ana' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(request).toHaveBeenCalledWith({
      method: 'put',
      url: '/users/1',
      body: { name: 'Ana' },
      queryParams: undefined,
      headers: undefined,
    });
    expect(result.current.data).toEqual({ id: 1, name: 'Ana' });
  });
});
