import express from 'express';
import { ModelDef } from './modelManager';
import { registerGenericHandlers } from './genericController';
import { requirePermission } from './rbacMiddleware';

export function createRouterForModel(model: ModelDef) {
  const router = express.Router();
  const handlers = registerGenericHandlers(model);

  router.post('/', requirePermission(model, 'create'), handlers.create);
  router.get('/', requirePermission(model, 'read'), handlers.list);
  router.get('/:id', requirePermission(model, 'read'), handlers.getById);
  router.put('/:id', requirePermission(model, 'update'), handlers.update);
  router.delete('/:id', requirePermission(model, 'delete'), handlers.del);

  return router;
}
