import { z } from 'zod';

import { defineApiRoutes } from '../core/define-api-routes';
import type { BodySchemaOf } from '../core/types';
import { testRoutes } from '../test/core-utils';
import type { UseApiMutationResult } from './use-api-mutation';

const personRoutes = defineApiRoutes({
  '/pessoa': {
    methods: {
      post: {
        bodySchema: z.object({
          nome: z.string(),
          idade: z.number(),
        }),
      },
    },
  },
});

type PostPessoaBodySchema = BodySchemaOf<
  typeof personRoutes,
  '/pessoa',
  'post'
>;
type PostPessoaBodyInput = z.input<NonNullable<PostPessoaBodySchema>>;

type HookBodySchema = UseApiMutationResult<
  typeof personRoutes,
  '/pessoa',
  'post',
  { method: 'post' }
>['bodySchema'];

type IsStronglyTypedBodySchema =
  NonNullable<HookBodySchema> extends z.ZodObject<{
    nome: z.ZodString;
    idade: z.ZodNumber;
  }>
    ? true
    : false;

describe('useApiMutation bodySchema inference', () => {
  it('infers bodySchema as the route-specific Zod object', () => {
    expect(personRoutes['/pessoa'].methods.post.bodySchema).toBeDefined();

    const isStronglyTyped: IsStronglyTypedBodySchema = true;
    expect(isStronglyTyped).toBe(true);
  });

  it('infers body input fields from bodySchema', () => {
    const valid: PostPessoaBodyInput = { nome: 'João', idade: 30 };
    expect(valid).toBeDefined();
  });

  it('rejects body input missing required schema fields', () => {
    // @ts-expect-error nome is required
    const invalid: PostPessoaBodyInput = {
      idade: 30,
    };

    expect(invalid).toBeDefined();
  });

  it('rejects body input with wrong field types', () => {
    const invalid: PostPessoaBodyInput = {
      nome: 'João',
      // @ts-expect-error idade must be number
      idade: '30',
    };

    expect(invalid).toBeDefined();
  });

  it('infers undefined bodySchema for methods without body', () => {
    type GetUsersBodySchema = BodySchemaOf<typeof testRoutes, '/users', 'get'>;
    const schema: GetUsersBodySchema = undefined;
    expect(schema).toBeUndefined();
  });
});
