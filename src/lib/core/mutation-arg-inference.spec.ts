import { testRoutes } from '../test/core-utils';
import type { MutationArg } from './types';

type PutUserVariables = MutationArg<
  typeof testRoutes,
  '/users/:userId',
  'put',
  { method: 'put' }
>;

describe('MutationArg inference', () => {
  it('requires body fields from bodySchema for PUT with path params', () => {
    const valid: PutUserVariables = {
      params: { userId: 1 },
      body: { name: 'Ana' },
    };

    expect(valid).toBeDefined();
  });

  it('rejects body missing required schema fields', () => {
    const invalid: PutUserVariables = {
      params: { userId: 1 },
      // @ts-expect-error property name is required in body
      body: {},
    };

    expect(invalid).toBeDefined();
  });

  it('rejects mutate without required route params', () => {
    // @ts-expect-error userId is required in params
    const invalid: PutUserVariables = {
      body: { name: 'Ana' },
    };

    expect(invalid).toBeDefined();
  });
});
