import { Request, Response, NextFunction } from 'express';

export function attachUserFromHeaders(req: Request, res: Response, next: NextFunction) {
  const id = req.header('x-user-id') || null;
  const rolesHeader = req.header('x-user-roles') || '';
  const roles = rolesHeader ? rolesHeader.split(',').map(s=>s.trim()) : [];
  (req as any).user = id ? { id, roles } : null;
  next();
}
