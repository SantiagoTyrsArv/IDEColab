import type { LongTaskEntry } from '../../shared/types';
import { LONG_TASK_THRESHOLD_MS } from '../../shared/constants';

/**
 * Inicia la observación de long tasks usando PerformanceObserver.
 *
 * **Por qué PerformanceObserver:** es la API nativa del navegador para
 * detectar tareas que bloquean el hilo principal por más de 50ms.
 * El entryType 'longtask' se reporta automáticamente cuando una tarea
 * excede el umbral.
 *
 * **Event Loop:** Las long tasks indican que una macrotarea está tomando
 * demasiado tiempo, impidiendo que el navegador pinte frames y responda
 * a interacciones. Detectarlas permite evidenciar el problema del modo
 * ingenuo.
 *
 * @param callback - Función que recibe cada long task detectada
 * @returns Función para detener la observación
 */
export function trackLongTasks(callback: (entry: LongTaskEntry) => void): () => void {
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  let observer: PerformanceObserver | null = null;

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask' && entry.duration >= LONG_TASK_THRESHOLD_MS) {
          callback({
            duration: entry.duration,
            startTime: entry.startTime,
            entryType: entry.entryType,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // Algunos navegadores no soportan 'longtask'
  }

  return () => {
    observer?.disconnect();
    observer = null;
  };
}
