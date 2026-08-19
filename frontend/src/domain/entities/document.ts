import type { Document } from '../../shared/types';

/**
 * Crea un nuevo documento con ID 自动生成.
 * Pure function: no tiene efectos secundarios.
 */
export function createDocument(id: string, content: string): Document {
  const now = new Date();
  return {
    id,
    content,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Actualiza el contenido de un documento, incrementando la versión.
 */
export function updateDocumentContent(doc: Document, content: string): Document {
  return {
    ...doc,
    content,
    updatedAt: new Date(),
    version: doc.version + 1,
  };
}
