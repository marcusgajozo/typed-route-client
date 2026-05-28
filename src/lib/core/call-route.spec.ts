import { createRouteClient, runCallRoute } from './call-route';
import { createMockTransport, testRoutes } from './test-utils';

describe('call-route', () => {
  describe('runCallRoute', () => {
    it('GET without params calls transport and returns parsed response', async () => {
      const request = jest.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
      });
      const transport = createMockTransport(request);

      const result = await runCallRoute(testRoutes, transport, '/users', {
        method: 'get',
      });

      expect(request).toHaveBeenCalledWith({
        method: 'get',
        url: '/users',
        body: undefined,
        queryParams: undefined,
        headers: undefined,
      });
      expect(result).toEqual({ ok: true });
    });

    it('throws when required route params are missing', async () => {
      const request = jest.fn();
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport(request),
      });

      await expect(
        client.runCallRoute('/users/:userId', {
          method: 'put',
          body: { name: 'Ana' },
        }),
      ).rejects.toThrow('Missing route params for "/users/:userId": userId');

      expect(request).not.toHaveBeenCalled();
    });

    it('replaces path params in the request url', async () => {
      const request = jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Ana' },
        status: 200,
      });
      const transport = createMockTransport(request);

      await runCallRoute(testRoutes, transport, '/users/:userId', {
        method: 'put',
        params: { userId: 42 },
        body: { name: 'Ana' },
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/users/42',
          body: { name: 'Ana' },
        }),
      );
    });
  });

  describe('createRouteClient', () => {
    it('callRoute defaults to GET when options are omitted', async () => {
      const request = jest.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
      });
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport(request),
      });

      const result = await client.callRoute('/users');

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'get', url: '/users' }),
      );
      expect(result).toEqual({ ok: true });
    });

    it('callRoute dispatches mutation methods', async () => {
      const request = jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Ana' },
        status: 200,
      });
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport(request),
      });

      await client.callRoute('/users/:userId', {
        method: 'put',
        params: { userId: 7 },
        body: { name: 'Ana' },
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/users/7',
        }),
      );
    });
  });
});
