import type { MetricsState } from '../../../shared/types';
import { INPDisplay } from './inp-display';
import { LongTaskCounter } from './long-task-counter';
import { INPHistoryChart } from './inp-history-chart';

interface MetricsPanelProps {
  metrics: MetricsState;
  onReset: () => void;
}

/**
 * Panel de métricas en vivo.
 *
 * **Accesibilidad:** usa role="complementary" y aria-label descriptivo.
 * Los valores numéricos se muestran con aria-live para que los lectores
 * de pantalla anuncien los cambios.
 */
export function MetricsPanel({ metrics, onReset }: MetricsPanelProps) {
  return (
    <aside role="complementary" aria-label="Panel de métricas de rendimiento" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Métricas de Performance</h2>
        <button
          onClick={onReset}
          className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700
                     rounded hover:bg-gray-600 transition-colors"
          aria-label="Reiniciar métricas"
        >
          Reiniciar
        </button>
      </div>

      <INPDisplay
        currentINP={metrics.currentINP}
        worstINP={metrics.worstINP}
        breakdown={metrics.inpBreakdown}
      />

      <LongTaskCounter count={metrics.longTaskCount} recentTasks={metrics.longTasks} />

      <INPHistoryChart history={metrics.inpHistory} />
    </aside>
  );
}
