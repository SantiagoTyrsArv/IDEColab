import { useCallback, useMemo } from 'react';
import { useEditor } from '../../application/hooks/use-editor';
import { useAutosave } from '../../application/hooks/use-autosave';
import { TextEditor } from '../components/editor/text-editor';
import { EditorToolbar } from '../components/editor/editor-toolbar';
import { MetricsPanel } from '../components/metrics/metrics-panel';
import { ModeSwitch } from '../components/mode/mode-switch';
import { useEditorStore } from '../../application/store';
import { countWords } from '../../domain/use-cases/count-words';

/**
 * Página principal del editor.
 *
 * Orquesta los hooks y componentes, manteniendo la presentación
 * separada de la lógica de negocio.
 */
export function EditorPage() {
  const {
    content,
    mode,
    saveStatus,
    metrics,
    spellCheckStatus,
    version,
    handleInput,
    handleDebouncedSpellCheck,
    setMode,
    resetMetrics,
  } = useEditor();

  const { scheduleAutosave } = useAutosave();
  const documentId = useEditorStore((s) => s.documentId);

  const wordStats = useMemo(() => countWords(content), [content]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      handleInput(newContent);
      scheduleAutosave(newContent, documentId);
      handleDebouncedSpellCheck(newContent, mode);
    },
    [handleInput, scheduleAutosave, documentId, handleDebouncedSpellCheck, mode],
  );

  const handleModeChange = useCallback(
    (newMode: typeof mode) => {
      setMode(newMode);
      resetMetrics();
    },
    [setMode, resetMetrics],
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">
            Editor Colaborativo <span className="text-editor-accent">· Event Loop Lab</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Caso de estudio: Event Loop, Tasks/Microtasks e INP en React + TypeScript
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Editor */}
          <div className="lg:col-span-2 space-y-4">
            <EditorToolbar
              mode={mode}
              saveStatus={saveStatus}
              wordCount={wordStats.words}
              charCount={wordStats.characters}
              spellCheckStatus={spellCheckStatus}
              version={version}
            />
            <TextEditor value={content} onChange={handleContentChange} />
          </div>

          {/* Columna derecha: Métricas y Controls */}
          <div className="space-y-4">
            <ModeSwitch mode={mode} onModeChange={handleModeChange} />
            <MetricsPanel metrics={metrics} onReset={resetMetrics} />
          </div>
        </div>
      </main>
    </div>
  );
}
