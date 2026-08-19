import { useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '../store';
import type { INPMetricData, LongTaskEntry } from '../../shared/types';
import { trackINP } from '../../infrastructure/metrics/inp-tracker';
import { trackLongTasks } from '../../infrastructure/metrics/long-task-observer';
import { updateMetricsWithINP, updateMetricsWithLongTask } from '../../domain/entities/metrics';
import { LONG_TASK_WINDOW_MS } from '../../shared/constants';

/**
 * Hook dedicado a medir y exponer métricas de performance.
 *
 * **Por qué hook separado:** separa la responsabilidad de medición
 * de la lógica del editor. Permite reutilizar las métricas en otros
 * componentes sin acoplarlas al editor.
 *
 * **PerformanceObserver:** observa 'longtask' entries. Cada long task
 * se agrega al historial con timestamp para calcular cuántas ocurrieron
 * en los últimos 10 segundos.
 *
 * **web-vitals onINP:** reporta cada interacción con su desglose
 * (inputDelay, processingDuration, presentationDelay).
 */
export function usePerformanceMetrics() {
  const store = useEditorStore();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const cleanupINP = trackINP((metric: INPMetricData) => {
      const state = useEditorStore.getState();
      const newMetrics = updateMetricsWithINP(state.metrics, metric, state.mode);
      store.setMetrics(newMetrics);
    });

    const cleanupLongTask = trackLongTasks((entry: LongTaskEntry) => {
      const state = useEditorStore.getState();
      const newMetrics = updateMetricsWithLongTask(state.metrics, entry, LONG_TASK_WINDOW_MS);
      store.setMetrics(newMetrics);
    });

    cleanupRef.current = () => {
      cleanupINP();
      cleanupLongTask();
    };

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const resetMetrics = useCallback(() => {
    store.resetMetrics();
  }, [store]);

  return {
    metrics: store.metrics,
    resetMetrics,
  };
}
