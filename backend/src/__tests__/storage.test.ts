import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../services/storage.js';
import type { Document } from '../shared-types.js';

describe('InMemoryStorage', () => {
  beforeEach(() => {
    // Limpiar storage antes de cada test
    storage.delete('test-doc');
    storage.delete('doc-001');
  });

  it('debería guardar y recuperar un documento', () => {
    const doc: Document = {
      id: 'test-doc',
      content: 'Hello world',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    const saved = storage.save(doc);
    expect(saved.id).toBe('test-doc');
    expect(saved.version).toBe(1);

    const retrieved = storage.get('test-doc');
    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('Hello world');
  });

  it('debería incrementar la versión al guardar', () => {
    const doc: Document = {
      id: 'test-doc',
      content: 'v1',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    storage.save(doc);
    const updated = storage.save({ ...doc, content: 'v2' });

    expect(updated.version).toBe(2);
    expect(updated.content).toBe('v2');
  });

  it('debería devolver undefined para documento inexistente', () => {
    const result = storage.get('nonexistent');
    expect(result).toBeUndefined();
  });

  it('debería listar todos los documentos', () => {
    const doc1: Document = {
      id: 'test-doc',
      content: 'Doc 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    storage.save(doc1);
    const all = storage.getAll();

    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.find((d) => d.id === 'test-doc')).toBeDefined();
  });

  it('debería eliminar un documento', () => {
    const doc: Document = {
      id: 'test-doc',
      content: 'To delete',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    storage.save(doc);
    const deleted = storage.delete('test-doc');

    expect(deleted).toBe(true);
    expect(storage.get('test-doc')).toBeUndefined();
  });
});
