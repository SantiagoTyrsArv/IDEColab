import type { ExecutionMode } from '../../../shared/types';

interface INPHistoryChartProps {
  readonly history: readonly { value: number; timestamp: number; mode: ExecutionMode }[];
}

/**
 * Gráfico simple de historial de INP usando barras CSS.
 * Compara visualmente el INP en modo ingenuo vs optimizado.
 *
 * **Por qué no recharts:** para un caso educativo, un gráfico de barras
 * CSS puro es más ligero, no depende de librerías externas, y es más
 * transparente pedagógicamente.
 */
export function INPHistoryChart({ history }: INPHistoryChartProps) {
  if (history.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Historial de INP
        </h3>
        <p className="text-xs text-gray-500 text-center py-4">
          Interactúa con el editor para ver datos aquí
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...history.map((h) => h.value), 1);
  const displayItems = history.slice(-20);

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Historial de INP (últimas {displayItems.length} interacciones)
      </h3>

      <div className="flex items-end gap-1 h-24">
        {displayItems.map((item, i) => {
          const height = (item.value / maxValue) * 100;
          const color = getBarColor(item.value);

          return (
            <div
              key={`${item.timestamp}-${i}`}
              className="flex-1 min-w-[4px] group relative"
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div
                className={`w-full h-full ${color} rounded-t-sm transition-all duration-200
                           group-hover:opacity-80`}
                role="img"
                aria-label={`INP: ${Math.round(item.value)}ms (${item.mode})`}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                            px-1.5 py-0.5 bg-gray-900 text-[9px] text-white rounded
                            opacity-0 group-hover:opacity-100 transition-opacity
                            whitespace-nowrap pointer-events-none z-10">
                {Math.round(item.value)}ms
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-metrics-good" /> Buena
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-metrics-warn" /> Regular
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-metrics-bad" /> Mala
          </span>
        </div>
        <span>ms</span>
      </div>
    </div>
  );
}

function getBarColor(value: number): string {
  if (value <= 200) return 'bg-metrics-good';
  if (value <= 500) return 'bg-metrics-warn';
  return 'bg-metrics-bad';
}
