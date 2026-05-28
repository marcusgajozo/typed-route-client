import { HttpTransportError } from './http-transport';

describe('http-transport', () => {
  describe('HttpTransportError', () => {
    it('stores status, data and raw error', () => {
      const raw = { cause: 'timeout' };
      const error = new HttpTransportError({
        message: 'Request failed',
        status: 500,
        data: { detail: 'server down' },
        raw,
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('HttpTransportError');
      expect(error.message).toBe('Request failed');
      expect(error.status).toBe(500);
      expect(error.data).toEqual({ detail: 'server down' });
      expect(error.raw).toBe(raw);
    });

    it('uses default message when omitted', () => {
      const error = new HttpTransportError({ raw: null });
      expect(error.message).toBe('HTTP request failed');
    });
  });
});
