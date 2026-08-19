import type { Document, SaveResult } from '../../shared/types';

/**
 * Web Worker para sincronización con el servidor.
 *
 * **Por qué Worker:** Las operaciones de red pueden incluir serialización/
 * deserialización de JSON pesada y procesamiento de respuestas. Al ejecutar
 * en un Worker, el procesamiento de la respuesta no bloquea el hilo principal.
 *
 * **Protocolo de mensajes:**
 * - Recibe: { type: 'save', document: Document } o { type: 'sync', documentId: string }
 * - Devuelve: { type: 'saveResult', result: SaveResult } o { type: 'syncResult', result: SyncResult }
 *
 * **Event Loop:** Las llamadas fetch dentro del Worker son asincrónicas.
 * El Worker puede recibir otros mensajes mientras espera la respuesta
 * de red, ya que cada fetch es independiente.
 */

import type { SyncResult } from '../../shared/types';

type WorkerMessage =
  | { type: 'save'; document: Document; apiBase: string }
  | { type: 'sync'; documentId: string; apiBase: string };

type WorkerResponse =
  | { type: 'saveResult'; result: SaveResult }
  | { type: 'syncResult'; result: SyncResult };

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, apiBase } = event.data;

  try {
    if (type === 'save') {
      const result = await saveDocument(event.data.document, apiBase);
      const response: WorkerResponse = { type: 'saveResult', result };
      self.postMessage(response);
    } else if (type === 'sync') {
      const result = await syncDocument(event.data.documentId, apiBase);
      const response: WorkerResponse = { type: 'syncResult', result };
      self.postMessage(response);
    }
  } catch (error) {
    // Enviar error de vuelta al hilo principal
    self.postMessage({
      type: type === 'save' ? 'saveResult' : 'syncResult',
      result: {
        success: false,
        savedAt: new Date(),
        documentId: event.data.document?.id ?? event.data.documentId ?? '',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
};

async function saveDocument(document: Document, apiBase: string): Promise<SaveResult> {
  const response = await fetch(`${apiBase}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Save failed: ${response.statusText}`);
  }

  return response.json() as Promise<SaveResult>;
}

async function syncDocument(documentId: string, apiBase: string): Promise<SyncResult> {
  const response = await fetch(`${apiBase}/api/documents/${documentId}/sync`);

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.statusText}`);
  }

  return response.json() as Promise<SyncResult>;
}

export {};
