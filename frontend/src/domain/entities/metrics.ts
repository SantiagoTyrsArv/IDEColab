import type { INPMetricData, LongTaskEntry, MetricsState, ExecutionMode } from '../../shared/types';

/** Estado inicial de métricas */
export const INITIAL_METRICS_STATE: MetricsState = {
  currentINP: 0,
  worstINP: 0,
  inpBreakdown: null,
  longTaskCount: 0,
  longTasks: [],
  inpHistory: [],
};

/**
 * Actualiza el estado de métricas con un nuevo dato de INP.
 * Pure function: recibe estado anterior + dato nuevo, devuelve estado nuevo.
 */
export function updateMetricsWithINP(
  state: MetricsState,
  metric: INPMetricData,
  mode: ExecutionMode,
): MetricsState {
  const newWorstINP = Math.max(state.worstINP, metric.value);
  const newHistory = [
    ...state.inpHistory,
    { value: metric.value, timestamp: metric.timestamp, mode },
  ].slice(-50); // Mantener últimos 50 registros

  return {
    ...state,
    currentINP: metric.value,
    worstINP: newWorstINP,
    inpBreakdown: {
      inputDelay: metric.inputDelay,
      processingDuration: metric.processingDuration,
      presentationDelay: metric.presentationDelay,
    },
    inpHistory: newHistory,
  };
}

/**
 * Actualiza el estado de métricas con una nueva long task.
 * Filtra tasks fuera de la ventana de tiempo configurada.
 */
export function updateMetricsWithLongTask(
  state: MetricsState,
  entry: LongTaskEntry,
  windowMs: number,
): MetricsState {
  const now = performance.now();
  const recentTasks = [...state.longTasks, entry].filter(
    (t) => now - t.startTime <= windowMs,
  );

  return {
    ...state,
    longTaskCount: recentTasks.length,
    longTasks: recentTasks,
  };
}
