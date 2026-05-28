import { renderHook, waitFor } from '@testing-library/react';

import { createRouteClient } from '../core/call-route';
import { createMockTransport, testRoutes } from '../core/test-utils';
import { createQueryClientWrapper } from './test-utils';
import { createUseApiQuery } from './use-api-query';

describe('use-api-query', () => {
  it('fetches data when route params are ready', async () => {
    const request = jest.fn().mockResolvedValue({
      data: { id: 1 },
      status: 200,
    });
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(request),
    });
    const useApiQuery = createUseApiQuery(client);

    const { result } = renderHook(
      () =>
        useApiQuery('/users/:userId', {
          params: { userId: 1 },
        }),
      { wrapper: createQueryClientWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ id: 1 });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: '/users/1',
      }),
    );
  });

  it('does not fetch while route params are missing', async () => {
    const request = jest.fn();
    const client = createRouteClient({
      routes: testRoutes,
      transport: createMockTransport(request),
    });
    const useApiQuery = createUseApiQuery(client);

    const { result } = renderHook(
      () =>
        useApiQuery('/users/:userId', {
          params: { userId: undefined },
        }),
      { wrapper: createQueryClientWrapper() },
    );

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle');
    });

    expect(request).not.toHaveBeenCalled();
  });
});
