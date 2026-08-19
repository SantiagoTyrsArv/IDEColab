import type { Document, SaveResult } from '../shared/types';

/**
 * Caso de uso: guardar un documento en el backend.
 *
 * **Por qué está en domain:** define QUÉ se hace (guardar el documento)
 * sin definir CÓMO se hace (fetch, XMLHttpRequest, etc.).
 * El detalle de implementación está en infrastructure/api.
 *
 * **Event Loop:** La llamada HTTP es una macrotarea de red. Con async/await,
 * el event loop puede procesar otros eventos mientras espera la respuesta.
 * No bloquea el hilo principal.
 *
 * @param document - Documento a guardar
 * @param saveFn - Función inyectada que realiza la persistencia real
 * @returns Resultado del guardado
 */
export async function saveDocument(
  document: Document,
  saveFn: (doc: Document) => Promise<SaveResult>,
): Promise<SaveResult> {
  return saveFn(document);
}
