import { Request, Response } from 'express';
import { ModelDef, tableNameForModel } from './modelManager';
import { prepare } from './db';

function toSqlCols(fields: string[]) {
  return fields.map(f => `"${f}"`).join(', ');
}

export function registerGenericHandlers(model: ModelDef) {
  const table = tableNameForModel(model);

  async function create(req: Request, res: Response) {
    const payload = req.body || {};
    const fields = model.fields.map(f => f.name).concat(model.ownerField? [model.ownerField] : []);
    const insertFields = fields.filter(f => payload[f] !== undefined);
    const placeholders = insertFields.map(_=>'?').join(', ');
    const values = insertFields.map(f => {
      const v = payload[f];
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v;
    });
    const sql = `INSERT INTO "${table}" (${toSqlCols(insertFields)}) VALUES (${placeholders})`;
    const stmt = prepare(sql);
    const info = stmt.run(...values);
    const row = prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(info.lastInsertRowid);
    res.json(row);
  }

  async function list(req: Request, res: Response) {
    const sql = `SELECT * FROM "${table}" ORDER BY id DESC LIMIT 100`;
    const rows = prepare(sql).all();
    res.json(rows);
  }

  async function getById(req: Request, res: Response) {
    const id = req.params.id;
    const row = prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  }

  async function update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = req.body || {};
    const upFields = Object.keys(payload).filter(k => k !== 'id' && payload[k] !== undefined);
    if (upFields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    const assignments = upFields.map(f => `"${f}" = ?`).join(', ');
    const values = upFields.map(f => payload[f]);
    const sql = `UPDATE "${table}" SET ${assignments}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    const stmt = prepare(sql);
    stmt.run(...values, id);
    const row = prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id);
    res.json(row);
  }

  async function del(req: Request, res: Response) {
    const id = req.params.id;
    const stmt = prepare(`DELETE FROM "${table}" WHERE id = ?`);
    const info = stmt.run(id);
    res.json({ deleted: info.changes > 0 });
  }

  return { create, list, getById, update, del };
}
