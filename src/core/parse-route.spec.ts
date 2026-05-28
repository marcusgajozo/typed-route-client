import {
  areRouteParamsReady,
  assertRouteParamsReady,
  extractRouteParamNames,
  hasRouteParams,
  parseRoute,
} from './parse-route';

describe('parse-route', () => {
  describe('parseRoute', () => {
    it('returns route unchanged when params are absent', () => {
      expect(parseRoute('/users')).toBe('/users');
    });

    it('replaces path params in the route', () => {
      expect(parseRoute('/users/:userId', { userId: 42 })).toBe('/users/42');
    });

    it('replaces multiple path params', () => {
      expect(
        parseRoute('/classes/:classId/rooms/:roomId', {
          classId: 1,
          roomId: 'A',
        }),
      ).toBe('/classes/1/rooms/A');
    });
  });

  describe('extractRouteParamNames', () => {
    it('returns empty array for static routes', () => {
      expect(extractRouteParamNames('/users')).toEqual([]);
    });

    it('extracts single and multiple param names', () => {
      expect(extractRouteParamNames('/users/:userId')).toEqual(['userId']);
      expect(extractRouteParamNames('/classes/:classId/rooms/:roomId')).toEqual(
        ['classId', 'roomId'],
      );
    });
  });

  describe('hasRouteParams', () => {
    it('detects whether route has params', () => {
      expect(hasRouteParams('/users')).toBe(false);
      expect(hasRouteParams('/users/:userId')).toBe(true);
    });
  });

  describe('areRouteParamsReady', () => {
    it('returns true for static routes', () => {
      expect(areRouteParamsReady('/users', undefined)).toBe(true);
    });

    it('returns false when required params are missing', () => {
      expect(areRouteParamsReady('/users/:userId', undefined)).toBe(false);
      expect(areRouteParamsReady('/users/:userId', { userId: undefined })).toBe(
        false,
      );
    });

    it('returns true when all required params are provided', () => {
      expect(areRouteParamsReady('/users/:userId', { userId: 1 })).toBe(true);
    });
  });

  describe('assertRouteParamsReady', () => {
    it('throws when params are missing', () => {
      expect(() => {
        assertRouteParamsReady('/users/:userId', undefined);
      }).toThrow('Missing route params for "/users/:userId": userId');
    });

    it('does not throw when params are ready', () => {
      expect(() => {
        assertRouteParamsReady('/users/:userId', { userId: 1 });
      }).not.toThrow();
    });
  });
});
