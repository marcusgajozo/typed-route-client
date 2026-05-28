import z from 'zod';

import { defineApiRoutes } from '../../../lib/core/define-api-routes';

export const apiRoutesUser = defineApiRoutes({
  '/users': {
    methods: {
      get: {
        responseSchema: z.array(
          z.object({
            id: z.number(),
            username: z.string(),
            email: z.string(),
            password: z.string(),
          }),
        ),
      },
    },
  },
  '/users/:userId': {
    methods: {
      put: {
        bodySchema: z.object({
          id: z.number(),
          username: z.string(),
          email: z.string(),
          password: z.string(),
        }),
      },
    },
  },
});
