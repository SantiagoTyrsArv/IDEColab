import { onINP } from 'web-vitals';
import type { INPMetricData } from '../../shared/types';

/**
 * Inicia el tracking de INP usando web-vitals (build de attribución).
 *
 * **Por qué web-vitals:** mide INP de forma estandarizada siguiendo
 * las especificaciones de Google. El build de attribución desglosa
 * el INP en inputDelay, processingDuration y presentationDelay,
 * lo que es clave para el propósito educativo.
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

      const { attribution } = metric as typeof metric & {
        attribution: {
          inputDelay: number;
          processingDuration: number;
          presentationDelay: number;
          interactionType: string;
          interactionTarget: string;
        };
      };

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
