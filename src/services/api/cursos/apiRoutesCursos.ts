import { defineApiRoutes } from '../../../lib/core/define-api-routes';

export const apiRoutesCursos = defineApiRoutes({
  '/cursos/:id': {
    methods: {
      delete: {},
    },
  },
});
