import express from 'express';
import { storage } from '../services/storage.js';

export const syncRoutes: express.Router = express.Router();

/**
 * GET /api/documents/:id/sync — Simula sincronización con otros usuarios.
 *
 * En un caso real, esto compararía versiones y resolvería conflictos.
 * Aquí simplemente devuelve el documento actual con un pequeño delay
 * para simular latencia de red.
 */
syncRoutes.get('/documents/:id/sync', async (req, res) => {
  // Simular latencia de red (200-500ms)
  const latency = 200 + Math.random() * 300;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const doc = storage.get(req.params.id);

  if (!doc) {
    res.status(404).json({ error: 'Documento no encontrado para sincronizar' });
    return;
  }

  res.json({
    remoteVersion: doc,
    lastSyncedAt: new Date(),
    conflicts: [],
  });
});
