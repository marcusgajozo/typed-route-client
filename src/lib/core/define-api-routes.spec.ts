import { z } from 'zod';

import { defineApiRoutes, mergeApiRoutes } from './define-api-routes';

describe('define-api-routes', () => {
  const routesA = defineApiRoutes({
    '/a': {
      methods: { get: { responseSchema: z.object({ a: z.boolean() }) } },
    },
  });

  const routesB = defineApiRoutes({
    '/b': {
      methods: { get: { responseSchema: z.object({ b: z.boolean() }) } },
    },
  });

  const routesC = defineApiRoutes({
    '/c': {
      methods: { get: { responseSchema: z.object({ c: z.boolean() }) } },
    },
  });

  const routesD = defineApiRoutes({
    '/d': {
      methods: { get: { responseSchema: z.object({ d: z.boolean() }) } },
    },
  });

  const routesE = defineApiRoutes({
    '/e': {
      methods: { get: { responseSchema: z.object({ e: z.boolean() }) } },
    },
  });

  it('defineApiRoutes returns the same object', () => {
    expect(defineApiRoutes(routesA)).toBe(routesA);
  });

  it('mergeApiRoutes merges one group', () => {
    expect(mergeApiRoutes(routesA)).toEqual(routesA);
  });

  it('mergeApiRoutes merges many groups without limit', () => {
    const merged = mergeApiRoutes(routesA, routesB, routesC, routesD, routesE);

    expect(Object.keys(merged).sort()).toEqual(['/a', '/b', '/c', '/d', '/e']);
    expect(merged['/a'].methods.get.responseSchema).toBeDefined();
    expect(merged['/e'].methods.get.responseSchema).toBeDefined();
  });

  it('later groups override duplicate route keys', () => {
    const first = defineApiRoutes({
      '/users': {
        methods: {
          get: { responseSchema: z.object({ from: z.literal('first') }) },
        },
      },
    });
    const second = defineApiRoutes({
      '/users': {
        methods: {
          get: { responseSchema: z.object({ from: z.literal('second') }) },
        },
      },
    });

    const merged = mergeApiRoutes(first, second);
    expect(merged['/users']).toBe(second['/users']);
  });
});
