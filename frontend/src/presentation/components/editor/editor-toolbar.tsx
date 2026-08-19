import type { ExecutionMode } from '../../../shared/types';

interface EditorToolbarProps {
  mode: ExecutionMode;
  saveStatus: string;
  wordCount: number;
  charCount: number;
  spellCheckStatus: string;
  version: number;
}

/**
 * Barra de herramientas del editor.
 * Muestra información contextual: estado de guardado, conteo, modo activo.
 */
export function EditorToolbar({
  mode,
  saveStatus,
  wordCount,
  charCount,
  spellCheckStatus,
  version,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-t-lg border border-gray-700 border-b-0">
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>
          <span className="font-medium text-gray-300">Modo:</span>{' '}
          <span className={mode === 'naive' ? 'text-metrics-bad' : 'text-metrics-good'}>
            {mode === 'naive' ? 'Ingenuo' : 'Optimizado'}
          </span>
        </span>
        <span>
          <span className="font-medium text-gray-300">Palabras:</span>{' '}
          <span className="text-editor-accent">{wordCount}</span>
        </span>
        <span>
          <span className="font-medium text-gray-300">Caracteres:</span>{' '}
          <span className="text-editor-accent">{charCount}</span>
        </span>
        <span>
          <span className="font-medium text-gray-300">v{version}</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-gray-300">Guardado:</span>
          <SaveStatusBadge status={saveStatus} />
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-gray-300">SpellCheck:</span>
          <SpellCheckBadge status={spellCheckStatus} />
        </span>
      </div>
    </div>
  );
}

function SaveStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idle: 'bg-gray-600',
    editing: 'bg-metrics-warn',
    saving: 'bg-blue-500',
    saved: 'bg-metrics-good',
    error: 'bg-metrics-bad',
  };
  const labels: Record<string, string> = {
    idle: 'Inactivo',
    editing: 'Editando...',
    saving: 'Guardando...',
    saved: 'Guardado',
    error: 'Error',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${colors[status] ?? colors.idle}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function SpellCheckBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idle: 'bg-gray-600',
    checking: 'bg-blue-500',
    done: 'bg-metrics-good',
  };
  const labels: Record<string, string> = {
    idle: 'Inactivo',
    checking: 'Revisando...',
    done: 'Completado',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${colors[status] ?? colors.idle}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
