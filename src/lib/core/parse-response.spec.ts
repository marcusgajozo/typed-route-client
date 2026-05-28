import { z } from 'zod';

import {
  parseBody,
  parseBodyFromConfig,
  parseErrorResponse,
  parseResponse,
  parseResponseForMethod,
} from './parse-response';
import { testRoutes } from './test-utils';

describe('parse-response', () => {
  const userSchema = z.object({ id: z.number(), name: z.string() });

  describe('parseResponse', () => {
    it('parses data with schema', () => {
      expect(parseResponse(userSchema, { id: 1, name: 'Ana' })).toEqual({
        id: 1,
        name: 'Ana',
      });
    });

    it('throws when data is invalid', () => {
      expect(() => parseResponse(userSchema, { id: 'x' })).toThrow();
    });
  });

  describe('parseBody', () => {
    it('parses body with schema', () => {
      expect(
        parseBody(z.object({ name: z.string() }), { name: 'Ana' }),
      ).toEqual({
        name: 'Ana',
      });
    });
  });

  describe('parseErrorResponse', () => {
    it('returns parsed error when valid', () => {
      const schema = z.object({ message: z.string() });
      expect(parseErrorResponse(schema, { message: 'fail' })).toEqual({
        message: 'fail',
      });
    });

    it('returns undefined when invalid', () => {
      const schema = z.object({ message: z.string() });
      expect(parseErrorResponse(schema, { message: 1 })).toBeUndefined();
    });
  });

  describe('parseBodyFromConfig', () => {
    it('returns body unchanged when schema is absent', () => {
      expect(parseBodyFromConfig(undefined, { any: true })).toEqual({
        any: true,
      });
    });

    it('validates body when schema exists', () => {
      expect(
        parseBodyFromConfig(
          { bodySchema: z.object({ name: z.string() }) },
          { name: 'Ana' },
        ),
      ).toEqual({ name: 'Ana' });
    });
  });

  describe('parseResponseForMethod', () => {
    it('parses response using route method schema', () => {
      expect(
        parseResponseForMethod(testRoutes, '/users', 'get', { ok: true }),
      ).toEqual({ ok: true });
    });

    it('returns raw data when schema is missing', () => {
      expect(
        parseResponseForMethod(
          { '/unknown': { methods: { get: {} } } },
          '/unknown',
          'get',
          { raw: true },
        ),
      ).toEqual({ raw: true });
    });
  });
});
