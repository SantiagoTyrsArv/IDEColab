import express from 'express';
import cors from 'cors';
import { documentRoutes } from './routes/documents.js';
import { syncRoutes } from './routes/sync.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// CORS restrictivo: solo permitir el frontend en desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Alternativa
];

// En producción, permitir cualquier origen de Cloud Run
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? true : (origin, callback) => {
    // Permitir requests sin origin (curl, Postman, workers)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

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
