import { Request, Response, NextFunction } from 'express';
import { ModelDef, tableNameForModel } from './modelManager';
import { prepare } from './db';

export function requirePermission(model: ModelDef, permission: 'create' | 'read' | 'update' | 'delete') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const rbac = model.rbac || {};

    // No user = deny
    if (!user || !user.roles || user.roles.length === 0) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin always has access
    if (user.roles.includes('Admin')) {
      const adminPerms = rbac['Admin'] || [];
      if (adminPerms.includes('all') || adminPerms.includes(permission)) {
        return next();
      }
    }

    // Check other roles (Manager, Viewer)
    for (const role of user.roles) {
      if (role === 'Admin') continue; // Already checked above
      if (role === 'Owner') continue; // Handle Owner separately below
      
      const perms = rbac[role] || [];
      if (perms.includes('all') || perms.includes(permission)) {
        return next();
      }
    }

    // Check Owner role (only for update/delete)
    if (user.roles.includes('Owner') && model.ownerField) {
      const ownerPerms = rbac['Owner'] || [];
      
      // Owner can perform the action if they have permission AND it's their record
      if (ownerPerms.includes('all') || ownerPerms.includes(permission)) {
        // For update/delete, check ownership
        if (permission === 'update' || permission === 'delete') {
          const id = req.params.id;
          if (!id) {
            return res.status(403).json({ error: 'Forbidden: Owner role requires record ID' });
          }

          const table = tableNameForModel(model);
          try {
            const row = prepare(
              `SELECT "${model.ownerField}" as owner FROM "${table}" WHERE id = ?`
            ).get(id) as { owner?: string | number };

            if (row && `${row.owner}` === `${user.id}`) {
              return next(); // Owner of this specific record
            }
          } catch (e) {
            console.error('Ownership check error:', e);
            return res.status(500).json({ error: 'Error checking ownership' });
          }
        } else if (permission === 'create') {
          // Owner can create records (they'll own them)
          return next();
        } else if (permission === 'read') {
          // For read, Owner can see all records (or implement filtering if needed)
          return next();
        }
      }
    }

    // No permission granted
    return res.status(403).json({ 
      error: `Forbidden: ${user.roles.join(', ')} role(s) cannot ${permission} ${model.name}` 
    });
  };
}