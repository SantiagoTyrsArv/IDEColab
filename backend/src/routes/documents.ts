import express from 'express';
import { storage } from '../services/storage.js';
import type { Document } from '../shared-types.js';

export const documentRoutes: express.Router = express.Router();

/**
 * POST /api/documents — Guardar o actualizar un documento.
 */
documentRoutes.post('/', (req, res) => {
  const doc = req.body as Document;

  if (!doc.id || typeof doc.content !== 'string') {
    res.status(400).json({ error: 'Documento inválido: se requiere id y content' });
    return;
  }

  const saved = storage.save(doc);

  res.json({
    success: true,
    savedAt: new Date(),
    documentId: saved.id,
  });
});

/**
 * GET /api/documents/:id — Obtener un documento por ID.
 */
documentRoutes.get('/:id', (req, res) => {
  const doc = storage.get(req.params.id);

  if (!doc) {
    res.status(404).json({ error: 'Documento no encontrado' });
    return;
  }

  res.json(doc);
});
