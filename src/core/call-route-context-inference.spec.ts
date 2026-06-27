import { createMockTransport, testRoutes } from '../test/core-utils';
import { createRouteClient, runCallRoute } from './call-route';
import type { HttpTransportRequest } from './http-transport';

type RequestContext = {
  showToast: boolean;
  silent?: boolean;
};

describe('call-route context inference', () => {
  it('callRoute accepts typed context when transport is HttpTransport<RequestContext>', () => {
    const transport = createMockTransport<RequestContext>((req) => {
      const showToast: boolean | undefined = req.context?.showToast;
      void showToast;
      return Promise.resolve({ data: { ok: true }, status: 200 });
    });

    const client = createRouteClient({
      routes: testRoutes,
      transport,
    });

    function typeCheckGet() {
      return client.callRoute('/users', {
        context: { showToast: true },
      });
    }

    function typeCheckMutation() {
      return client.callRoute('/users/:userId', {
        method: 'put',
        params: { userId: 1 },
        body: { name: 'Ana' },
        context: { showToast: false, silent: true },
      });
    }

    function typeCheckRunCallRoute() {
      return client.runCallRoute('/users', {
        method: 'get',
        context: { showToast: true },
      });
    }

    expect(typeCheckGet).toBeDefined();
    expect(typeCheckMutation).toBeDefined();
    expect(typeCheckRunCallRoute).toBeDefined();
  });

  it('rejects invalid context shape on typed transport', () => {
    const transport = createMockTransport<RequestContext>(jest.fn());
    const client = createRouteClient({
      routes: testRoutes,
      transport,
    });

    function typeCheckInvalidContext() {
      return client.callRoute('/users', {
        // @ts-expect-error showToast must be boolean
        context: { showToast: 'yes' },
      });
    }

    function typeCheckUnknownField() {
      return client.callRoute('/users', {
        // @ts-expect-error unknown context field
        context: { showToast: true, extra: true },
      });
    }

    expect(typeCheckInvalidContext).toBeDefined();
    expect(typeCheckUnknownField).toBeDefined();
  });

  it('rejects context when transport has no context type', () => {
    const transport = createMockTransport(jest.fn());
    const client = createRouteClient({
      routes: testRoutes,
      transport,
    });

    function typeCheckContextNotAllowed() {
      return client.callRoute('/users', {
        // @ts-expect-error context is not allowed without typed transport
        context: { showToast: true },
      });
    }

    expect(typeCheckContextNotAllowed).toBeDefined();
  });

  it('runCallRoute forwards typed context to transport.request', () => {
    function typeCheck() {
      const transport = createMockTransport<RequestContext>(jest.fn());

      return runCallRoute(testRoutes, transport, '/users', {
        method: 'get',
        context: { showToast: true },
      });
    }

    function typeCheckInvalid() {
      const transport = createMockTransport<RequestContext>(jest.fn());

      return runCallRoute(testRoutes, transport, '/users', {
        method: 'get',
        // @ts-expect-error showToast must be boolean
        context: { showToast: 1 },
      });
    }

    expect(typeCheck).toBeDefined();
    expect(typeCheckInvalid).toBeDefined();
  });

  it('HttpTransportRequest context is typed in transport implementation', () => {
    function typeCheckTransportImpl() {
      const transport = createMockTransport<RequestContext>(
        (req: HttpTransportRequest<RequestContext>) => {
          if (req.context?.showToast) {
            return Promise.resolve({ data: { ok: true }, status: 200 });
          }

          return Promise.resolve({ data: { ok: false }, status: 200 });
        },
      );

      return transport;
    }

    expect(typeCheckTransportImpl).toBeDefined();
  });
});
