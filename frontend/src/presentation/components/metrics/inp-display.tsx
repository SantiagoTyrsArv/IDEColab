interface INPDisplayProps {
  currentINP: number;
  worstINP: number;
  breakdown: {
    inputDelay: number;
    processingDuration: number;
    presentationDelay: number;
  } | null;
}

/**
 * Muestra el INP actual, el peor registrado, y el desglose por fase.
 *
 * **Event Loop educativo:** el desglose muestra exactamente dónde se
 * gastó el tiempo durante la última interacción:
 * - inputDelay: tiempo entre el input del usuario y el inicio del handler
 * - processingDuration: tiempo que tomaron los event listeners
 * - presentationDelay: tiempo desde que terminaron los handlers hasta el paint
 */
export function INPDisplay({ currentINP, worstINP, breakdown }: INPDisplayProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        INP (Interaction to Next Paint)
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          label="INP Actual"
          value={currentINP}
          unit="ms"
          rating={getINPRating(currentINP)}
        />
        <MetricCard
          label="Peor INP"
          value={worstINP}
          unit="ms"
          rating={getINPRating(worstINP)}
        />
      </div>

      {breakdown && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">Desglose de la última interacción</h4>
          <BreakdownBar
            label="Input Delay"
            value={breakdown.inputDelay}
            total={currentINP}
            color="bg-blue-500"
          />
          <BreakdownBar
            label="Processing Duration"
            value={breakdown.processingDuration}
            total={currentINP}
            color="bg-yellow-500"
          />
          <BreakdownBar
            label="Presentation Delay"
            value={breakdown.presentationDelay}
            total={currentINP}
            color="bg-purple-500"
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  rating,
}: {
  label: string;
  value: number;
  unit: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}) {
  const colors = {
    good: 'text-metrics-good',
    'needs-improvement': 'text-metrics-warn',
    poor: 'text-metrics-bad',
  };

  return (
    <div className="p-3 bg-gray-900 rounded-lg">
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-2xl font-bold ${colors[rating]}`} aria-live="polite">
        {Math.round(value)}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-32 text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-label={`${label}: ${Math.round(value)}ms`}
        />
      </div>
      <span className="w-12 text-right text-gray-300 font-mono">
        {Math.round(value)}ms
      </span>
    </div>
  );
}

function getINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}
