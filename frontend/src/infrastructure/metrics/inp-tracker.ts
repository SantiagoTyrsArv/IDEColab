import { onINP } from 'web-vitals/attribution';
import type { INPMetricData } from '../../shared/types';

/**
 * Inicia el tracking de INP usando web-vitals (build de attribución).
 *
 * **Por qué web-vitals/attribution:** el build de attribución incluye
 * el desglose de INP en inputDelay, processingDuration y presentationDelay,
 * lo que es clave para el propósito educativo. El build estándar NO
 * incluye estos datos.
 *
 * **reportAllChanges:** se activa para ver cada interacción, no solo
 * el peor caso final. Esto permite comparar en tiempo real entre modos.
 *
 * @param callback - Función que recibe cada medición de INP
 * @returns Función para detener el tracking
 */
export function trackINP(
  callback: (metric: INPMetricData) => void,
): () => void {
  let stopped = false;

  onINP(
    (metric) => {
      if (stopped) return;

      // Con web-vitals/attribution, attribution siempre está presente
      const { attribution } = metric;

      callback({
        value: metric.value,
        inputDelay: attribution.inputDelay,
        processingDuration: attribution.processingDuration,
        presentationDelay: attribution.presentationDelay,
        interactionType: attribution.interactionType ?? 'unknown',
        interactionTarget: attribution.interactionTarget ?? 'unknown',
        timestamp: performance.now(),
      });
    },
    { reportAllChanges: true },
  );

  return () => {
    stopped = true;
  };
}
