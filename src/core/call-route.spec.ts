import { createMockTransport, testRoutes } from '../test/core-utils';
import { createRouteClient, runCallRoute } from './call-route';

describe('call-route', () => {
  describe('type safety', () => {
    it('runCallRoute requires params when route has path params', () => {
      function typeCheck() {
        const transport = createMockTransport(jest.fn());

        // @ts-expect-error params is required when the route has :userId
        return runCallRoute(testRoutes, transport, '/users/:userId', {
          method: 'put',
          body: { name: 'Ana' },
        });
      }

      expect(typeCheck).toBeDefined();
    });

    it('client.runCallRoute requires params when route has path params', () => {
      function typeCheck() {
        const client = createRouteClient({
          routes: testRoutes,
          transport: createMockTransport(jest.fn()),
        });

        // @ts-expect-error params is required when the route has :userId
        return client.runCallRoute('/users/:userId', {
          method: 'put',
          body: { name: 'Ana' },
        });
      }

      expect(typeCheck).toBeDefined();
    });

    it('runCallRoute rejects body that does not match bodySchema', () => {
      function typeCheck() {
        const transport = createMockTransport(jest.fn());

        return runCallRoute(testRoutes, transport, '/users/:userId', {
          method: 'put',
          params: { userId: 1 },
          // @ts-expect-error body must match bodySchema fields
          body: {},
        });
      }

      expect(typeCheck).toBeDefined();
    });

    it('runCallRoute rejects body on routes without bodySchema', () => {
      function typeCheck() {
        const transport = createMockTransport(jest.fn());

        return runCallRoute(testRoutes, transport, '/users', {
          method: 'get',
          // @ts-expect-error GET on /users has no bodySchema
          body: { name: 'Ana' },
        });
      }

      expect(typeCheck).toBeDefined();
    });

    it('runCallRoute rejects params on routes without path params', () => {
      function typeCheck() {
        const transport = createMockTransport(jest.fn());

        return runCallRoute(testRoutes, transport, '/users', {
          method: 'get',
          // @ts-expect-error /users has no path params
          params: { userId: 1 },
        });
      }

      expect(typeCheck).toBeDefined();
    });

    it('runCallRoute requires body when bodySchema exists', () => {
      function typeCheck() {
        const transport = createMockTransport(jest.fn());

        return runCallRoute(testRoutes, transport, '/users/:userId', {
          method: 'put',
          params: { userId: 1 },
          // @ts-expect-error body is required when the method has bodySchema
          body: undefined,
        });
      }

      expect(typeCheck).toBeDefined();
    });
  });

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
        context: undefined,
      });
      expect(result).toEqual({ ok: true });
    });

    it('throws at runtime when params are missing', async () => {
      const request = jest.fn();
      const transport = createMockTransport(request);

      await expect(
        // @ts-expect-error params is required when the route has :userId
        runCallRoute(testRoutes, transport, '/users/:userId', {
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

    it('callRoute dispatches mutation methods with params and body', async () => {
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
          body: { name: 'Ana' },
        }),
      );
    });

    it('client.runCallRoute uses strict options', async () => {
      const request = jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Ana' },
        status: 200,
      });
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport(request),
      });

      await client.runCallRoute('/users/:userId', {
        method: 'put',
        params: { userId: 3 },
        body: { name: 'Ana' },
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/users/3', body: { name: 'Ana' } }),
      );
    });

    it('forwards context to transport.request on callRoute', async () => {
      type RequestContext = { showToast: boolean };

      const request = jest.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
      });
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport<RequestContext>(request),
      });

      await client.callRoute('/users', {
        context: { showToast: true },
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/users',
          context: { showToast: true },
        }),
      );
    });

    it('forwards context to transport.request on runCallRoute', async () => {
      type RequestContext = { showToast: boolean; silent?: boolean };

      const request = jest.fn().mockResolvedValue({
        data: { id: 1, name: 'Ana' },
        status: 200,
      });
      const client = createRouteClient({
        routes: testRoutes,
        transport: createMockTransport<RequestContext>(request),
      });

      await client.runCallRoute('/users/:userId', {
        method: 'put',
        params: { userId: 5 },
        body: { name: 'Ana' },
        context: { showToast: false, silent: true },
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/users/5',
          context: { showToast: false, silent: true },
        }),
      );
    });
  });
});
