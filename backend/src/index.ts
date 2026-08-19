import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { documentRoutes } from './routes/documents.js';
import { syncRoutes } from './routes/sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ?? 8080;

// CORS restrictivo: solo permitir el frontend en desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternativa
];

// En producción, todo se sirve desde el mismo origen — CORS no aplica
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permitir requests sin origin (curl, Postman, workers)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    }),
  );
}

app.use(express.json());

// ─── Rutas de API ────────────────────────────────────────────
app.use('/api/documents', documentRoutes);
app.use('/api', syncRoutes);

// Health check para Render
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Archivos estáticos del frontend ─────────────────────────
// En desarrollo: backend/public/ puede no existir, servir solo si existe
// En producción: el Dockerfile copia el build del frontend aquí
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ─── SPA catch-all ───────────────────────────────────────────
// Debe ir DESPUÉS de las rutas de API y de express.static.
// Si la request no fue API ni un archivo estático, devolver index.html
// para que React Router maneje la ruta en el cliente.
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Backend] Servidor escuchando en http://localhost:${PORT}`);
});
