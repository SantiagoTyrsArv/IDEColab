import type { SyncResult } from '../../shared/types';

/**
 * Caso de uso: sincronizar un documento con el servidor.
 *
 * **Por qué está en domain:** la lógica de sincronización (comparar versiones,
 * resolver conflictos) es lógica de negocio. El mecanismo de transporte
 * (WebSocket, fetch) es un detalle de infrastructure.
 *
 * **Event Loop:** El WebSocket o fetch es una macrotarea de red. Los mensajes
 * entrantes se procesan como macrotareas, lo que permite que el hilo principal
 * siga respondiendo a interacciones del usuario mientras espera datos del servidor.
 *
 * @param documentId - ID del documento a sincronizar
 * @param syncFn - Función inyectada que realiza la sincronización real
 * @returns Resultado de la sincronización
 */
export async function syncDocument(
  documentId: string,
  syncFn: (id: string) => Promise<SyncResult>,
): Promise<SyncResult> {
  return syncFn(documentId);
}
