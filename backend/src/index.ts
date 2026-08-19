import express from 'express';
import cors from 'cors';
import { documentRoutes } from './routes/documents.js';
import { syncRoutes } from './routes/sync.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/documents', documentRoutes);
app.use('/api', syncRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Backend] Servidor escuchando en http://localhost:${PORT}`);
});
