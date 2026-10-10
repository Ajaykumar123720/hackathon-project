import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { apiRouter } from './server/routes/api';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Mount API Router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/healthz', (req, res) => {
    res.json({ status: 'healthy', platform: 'SecureGate AI', timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SecureGate AI] DevSecOps Server running on http://0.0.0.0:${PORT}`);
    console.log(`[SecureGate AI] API endpoints mounted at /api/*`);
  });
}

startServer().catch((err) => {
  console.error('[SecureGate AI] Server failed to start:', err);
  process.exit(1);
});
