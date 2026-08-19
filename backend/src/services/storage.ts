import type { Document } from '../shared-types.js';

/**
 * Almacenamiento en memoria para documentos.
 * En producción esto sería Firestore o similar.
 */
class InMemoryStorage {
  private documents = new Map<string, Document>();

  save(doc: Document): Document {
    const existing = this.documents.get(doc.id);
    const updated: Document = {
      ...doc,
      version: (existing?.version ?? 0) + 1,
      updatedAt: new Date(),
    };
    this.documents.set(doc.id, updated);
    return updated;
  }

  get(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  delete(id: string): boolean {
    return this.documents.delete(id);
  }
}

export const storage = new InMemoryStorage();

// Documento por defecto para las demostraciones
storage.save({
  id: 'doc-001',
  content: 'Bienvenido al Editor Colaborativo — Event Loop Lab.\n\nEste editor demuestra el comportamiento del Event Loop de JavaScript ante interacciones reales de usuario.',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
});
