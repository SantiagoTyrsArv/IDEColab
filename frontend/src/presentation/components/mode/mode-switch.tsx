import type { ExecutionMode } from '../../../shared/types';

interface ModeSwitchProps {
  mode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
}

/**
 * Selector de modo: Ingenuo vs Optimizado.
 *
 * **Propósito educativo:** permite al usuario alternar entre ambos modos
 * y observar la diferencia en métricas en tiempo real. La explicación
 * debajo del switch enseña qué cambia internamente.
 */
export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Modo de Ejecución
      </h3>

      <div className="flex rounded-lg bg-gray-900 p-1 mb-3">
        <button
          onClick={() => onModeChange('naive')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${mode === 'naive'
              ? 'bg-metrics-bad text-white shadow'
              : 'text-gray-400 hover:text-gray-200'
            }`}
          aria-pressed={mode === 'naive'}
        >
          Ingenuo
        </button>
        <button
          onClick={() => onModeChange('optimized')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${mode === 'optimized'
              ? 'bg-metrics-good text-gray-900 shadow'
              : 'text-gray-400 hover:text-gray-200'
            }`}
          aria-pressed={mode === 'optimized'}
        >
          Optimizado
        </button>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        {mode === 'naive' ? (
          <>
            <p><strong className="text-gray-300">Modo Ingenuo:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Spell check corre en el hilo principal (bloquea)</li>
              <li>Sincronización usa fetch síncrono</li>
              <li>Sin uso de Web Workers ni scheduler</li>
              <li>Resultado: long tasks e INP degradado</li>
            </ul>
          </>
        ) : (
          <>
            <p><strong className="text-gray-300">Modo Optimizado:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Conteo de palabras: queueMicrotask (microtarea)</li>
              <li>Spell check: Web Worker (hilo separado)</li>
              <li>Autoguardado: scheduler.postTask (macrotarea prioritaria)</li>
              <li>Sincronización: async/await (no bloquea)</li>
              <li>Resultado: sin long tasks, INP bajo</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
