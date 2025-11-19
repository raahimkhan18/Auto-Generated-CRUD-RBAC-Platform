import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ensureModelsDir, writeModelFile, readAllModels, ensureTableForModel, ModelDef, readModelByName } from './modelManager';
import { createRouterForModel } from './dynamicRouter';
import { attachUserFromHeaders } from './authStub';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(attachUserFromHeaders);

const API_PREFIX = '/api';

// Store active model routes
const activeRoutes = new Map<string, { path: string; router: express.Router }>();

// Function to unregister a route (for hot reload)
function unregisterRoute(routePath: string) {
  if (activeRoutes.has(routePath)) {
    // Express doesn't support route removal easily, so we'll track and override
    activeRoutes.delete(routePath);
  }
}

async function registerModelEndpoints(model: ModelDef) {
  ensureTableForModel(model);
  const table = (model.tableName && model.tableName.trim()) 
    ? model.tableName 
    : model.name.toLowerCase() + 's';
  const routePath = `${API_PREFIX}/${table}`;
  
  // Remove old route if exists
  unregisterRoute(routePath);
  
  const router = createRouterForModel(model);
  
  // Store the router
  activeRoutes.set(routePath, { path: routePath, router });
  
  // Register the route
  app.use(routePath, router);
  
  console.log(`✅ Registered routes for ${model.name} at ${routePath}`);
}

// Admin endpoints
app.get('/admin/models', async (req, res) => {
  try {
    const models = await readAllModels();
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/models/:name', async (req, res) => {
  try {
    const model = await readModelByName(req.params.name);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/admin/models/publish', async (req, res) => {
  try {
    const model = req.body as ModelDef;
    if (!model || !model.name) {
      return res.status(400).json({ error: 'Invalid model: name is required' });
    }
    if (!model.fields || !Array.isArray(model.fields)) {
      return res.status(400).json({ error: 'Invalid model: fields array is required' });
    }
    
    await ensureModelsDir();
    await writeModelFile(model);
    await registerModelEndpoints(model);
    
    res.json({ ok: true, model, message: 'Model published successfully' });
  } catch (error: any) {
    console.error('Error publishing model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeRoutes: Array.from(activeRoutes.keys()) });
});

async function bootstrap() {
  try {
    await ensureModelsDir();
    const models = await readAllModels();
    console.log(`📦 Loading ${models.length} existing models...`);
    
    for (const m of models) {
      try {
        await registerModelEndpoints(m);
      } catch (e) {
        console.error(`❌ Error registering model ${m.name}:`, e);
      }
    }
    
    console.log('✅ Bootstrap complete');
  } catch (error) {
    console.error('❌ Bootstrap error:', error);
  }
}

bootstrap();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`📝 Admin API: http://localhost:${PORT}/admin/models`);
});

export default app;