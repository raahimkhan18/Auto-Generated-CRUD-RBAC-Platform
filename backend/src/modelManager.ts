import fs from 'fs-extra';
import path from 'path';
import { exec } from './db';

export type FieldDef = {
  name: string;
  type: 'string'|'number'|'boolean'|'text'|'date'|'relation';
  required?: boolean;
  unique?: boolean;
  default?: any;
  relation?: { model: string, field: string };
};

export type ModelDef = {
  name: string;
  tableName?: string;
  fields: FieldDef[];
  ownerField?: string;
  rbac?: Record<string, string[]>;
};

const MODELS_DIR = path.join(__dirname, '..', 'models');

export async function ensureModelsDir() {
  await fs.ensureDir(MODELS_DIR);
}

export async function writeModelFile(model: ModelDef) {
  const filePath = path.join(MODELS_DIR, `${model.name}.json`);
  await fs.writeJSON(filePath, model, { spaces: 2 });
  return filePath;
}

export async function readAllModels(): Promise<ModelDef[]> {
  await ensureModelsDir();
  const files = await fs.readdir(MODELS_DIR);
  const models: ModelDef[] = [];
  for (const f of files.filter(f => f.endsWith('.json'))) {
    const m = await fs.readJSON(path.join(MODELS_DIR, f));
    models.push(m);
  }
  return models;
}

export async function readModelByName(name: string): Promise<ModelDef | null> {
  const p = path.join(MODELS_DIR, `${name}.json`);
  if (!await fs.pathExists(p)) return null;
  return fs.readJSON(p);
}

function sqlTypeForField(t: string) {
  switch(t) {
    case 'string': return 'VARCHAR(255)';
    case 'number': return 'REAL';
    case 'boolean': return 'INTEGER';
    case 'text': return 'TEXT';
    case 'date': return 'TEXT';
    default: return 'TEXT';
  }
}

export function tableNameForModel(model: ModelDef) {
  if (model.tableName && model.tableName.trim()) return model.tableName;
  return model.name.toLowerCase() + 's';
}

export function ensureTableForModel(model: ModelDef) {
  const table = tableNameForModel(model);
  const cols = [
    `id INTEGER PRIMARY KEY AUTOINCREMENT`,
    `createdAt TEXT DEFAULT CURRENT_TIMESTAMP`,
    `updatedAt TEXT DEFAULT CURRENT_TIMESTAMP`
  ];
  for (const f of model.fields) {
    const colType = sqlTypeForField(f.type);
    const colParts = [`"${f.name}" ${colType}`];
    if (f.required) colParts.push('NOT NULL');
    if (f.unique) colParts.push('UNIQUE');
    if (f.default !== undefined) {
      const def = typeof f.default === 'string' ? `'${f.default}'` : f.default;
      colParts.push(`DEFAULT ${def}`);
    }
    cols.push(colParts.join(' '));
  }
  if (model.ownerField && !model.fields.find(x=>x.name===model.ownerField)) {
    cols.push(`"${model.ownerField}" VARCHAR(255)`);
  }
  const sql = `CREATE TABLE IF NOT EXISTS "${table}" (${cols.join(', ')});`;
  exec(sql);
}
