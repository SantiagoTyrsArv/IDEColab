import type { LongTaskEntry } from '../../../shared/types';
import { LONG_TASK_THRESHOLD_MS } from '../../../shared/constants';

interface LongTaskCounterProps {
  count: number;
  recentTasks: readonly LongTaskEntry[];
}

/**
 * Muestra el conteo de long tasks en los últimos 10 segundos.
 *
 * **Por qué importa:** las long tasks (>50ms) indican que el event loop
 * del navegador estuvo bloqueado. En modo ingenuo, deberíamos ver muchas
 * long tasks. En modo optimizado, deberían casi desaparecer.
 *
 * **Event Loop:** cada long task es una macrotarea que tomó más de 50ms,
 * impidiendo que el navegador pinte frames durante ese tiempo.
 */
export function LongTaskCounter({ count, recentTasks }: LongTaskCounterProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Long Tasks (&gt;{LONG_TASK_THRESHOLD_MS}ms)
      </h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`text-3xl font-bold ${count > 0 ? 'text-metrics-bad' : 'text-metrics-good'}`}
          aria-live="polite"
        >
          {count}
        </span>
        <span className="text-xs text-gray-400">en los últimos 10s</span>
      </div>

      {recentTasks.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {recentTasks
            .slice(-5)
            .reverse()
            .map((task, i) => (
              <div
                key={`${task.startTime}-${i}`}
                className="flex justify-between text-[10px] text-gray-400 py-0.5 border-t border-gray-700"
              >
                <span>{task.entryType}</span>
                <span className="font-mono text-metrics-bad">{task.duration.toFixed(1)}ms</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
