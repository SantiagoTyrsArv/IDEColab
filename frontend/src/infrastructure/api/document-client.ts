import type { Document, SaveResult, SyncResult } from '../../shared/types';
import { API_BASE_URL } from '../../shared/constants';

/**
 * Cliente HTTP para interactuar con el backend.
 *
 * **Por qué aquí (infrastructure):** el detalle de CÓMO se comunican
 * frontend y backend (fetch, headers, URL) es un detalle técnico,
 * no lógica de negocio. El caso de uso en domain solo define QUÉ se hace.
 *
 * **Event Loop:** Las llamadas fetch son macrotareas de red. El event loop
 * procesa otros eventos mientras espera la respuesta del servidor.
 */

export async function saveDocumentToServer(document: Document): Promise<SaveResult> {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Error al guardar: ${response.statusText}`);
  }

  return response.json() as Promise<SaveResult>;
}

export async function loadDocumentFromServer(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`);

  if (!response.ok) {
    throw new Error(`Error al cargar: ${response.statusText}`);
  }

  return response.json() as Promise<Document>;
}

export async function syncDocumentWithServer(documentId: string): Promise<SyncResult> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/sync`);

  if (!response.ok) {
    throw new Error(`Error al sincronizar: ${response.statusText}`);
  }

  return response.json() as Promise<SyncResult>;
}
