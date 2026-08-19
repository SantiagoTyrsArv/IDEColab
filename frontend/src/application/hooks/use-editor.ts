import { useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '../store';
import { countWords } from '../../domain/use-cases/count-words';
import { detectMisspelled } from '../../domain/use-cases/detect-misspelled';
import { updateMetricsWithINP, updateMetricsWithLongTask } from '../../domain/entities/metrics';
import { runAsMicrotask } from '../../infrastructure/scheduling/microtask';
import { trackINP } from '../../infrastructure/metrics/inp-tracker';
import { trackLongTasks } from '../../infrastructure/metrics/long-task-observer';
import { DICTIONARY_WORDS, LONG_TASK_WINDOW_MS } from '../../shared/constants';
import type { ExecutionMode, SpellCheckResult } from '../../shared/types';
import SpellCheckWorker from '../../infrastructure/workers/spellcheck.worker?worker';

/**
 * Hook que conecta el editor con la lógica de dominio.
 *
 * **Responsabilidades:**
 * 1. Recibir input del usuario y despachar al store
 * 2. Ejecutar countWords como microtarea
 * 3. Ejecutar spell check DIRECTAMENTE en el handler (naive) o via Worker (optimized)
 * 4. Iniciar tracking de métricas (INP + long tasks)
 *
 * **Por qué NO hay debounce en spell check:**
 * Para que web-vitals capture el INP correctamente, el trabajo pesado debe
 * ejecutarse EN EL MISMO TASK que el input event. Si lo diferimos con
 * setTimeout, web-vitals no lo incluye en la medición de INP porque
 * es una macrotarea separada.
 */
export function useEditor() {
  const store = useEditorStore();
  const cleanupINPRef = useRef<(() => void) | null>(null);
  const cleanupLongTaskRef = useRef<(() => void) | null>(null);
  const workerRef = useRef<InstanceType<typeof SpellCheckWorker> | null>(null);

  /** Inicia el tracking de métricas al montar */
  useEffect(() => {
    cleanupINPRef.current = trackINP((metric) => {
      const state = useEditorStore.getState();
      const newMetrics = updateMetricsWithINP(state.metrics, metric, state.mode);
      store.setMetrics(newMetrics);
    });

    cleanupLongTaskRef.current = trackLongTasks((entry) => {
      const state = useEditorStore.getState();
      const newMetrics = updateMetricsWithLongTask(state.metrics, entry, LONG_TASK_WINDOW_MS);
      store.setMetrics(newMetrics);
    });

    return () => {
      cleanupINPRef.current?.();
      cleanupLongTaskRef.current?.();
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  /**
   * Obtiene o crea el Web Worker de spell check.
   */
  const getSpellCheckWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new SpellCheckWorker();
    }
    return workerRef.current;
  }, []);

  /**
   * Ejecuta el spell check en un Web Worker.
   * El Worker corre en un hilo separado, sin bloquear el main thread.
   */
  const runSpellCheckInWorker = useCallback(
    (text: string): Promise<SpellCheckResult> => {
      return new Promise((resolve, reject) => {
        const worker = getSpellCheckWorker();

        const handleMessage = (event: MessageEvent<{ type: string; result: SpellCheckResult }>) => {
          if (event.data.type === 'result') {
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleError);
            resolve(event.data.result);
          }
        };

        const handleError = (event: ErrorEvent) => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          reject(new Error(`Worker error: ${event.message}`));
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);

        worker.postMessage({ type: 'check', text, dictionary: DICTIONARY_WORDS });
      });
    },
    [getSpellCheckWorker],
  );

  /**
   * Maneja el input del usuario.
   *
   * **MODO INGENUDO:** Ejecuta countWords (microtarea) Y detectMisspelled
   * (síncrono, bloqueante) DIRECTAMENTE en el handler. web-vitals capturará
   * el tiempo total como INP porque todo ocurre en el mismo task.
   *
   * **MODO OPTIMIZADO:** Ejecuta countWords (microtarea) y delega
   * detectMisspelled al Web Worker (hilo separado). El main thread queda
   * libre, web-vitals capturará un INP bajo.
   *
   * **Por qué no hay debounce:** El debounce de 600ms ejecutaba el spell
   * check en una macrotarea separada, y web-vitals NO la incluía en la
   * medición de INP. Ahora todo corre en el mismo task del input event.
   */
  const handleInput = useCallback(
    (newContent: string, mode: ExecutionMode) => {
      store.setContent(newContent);
      store.setSaveStatus('editing');

      // Microtarea: countWords se ejecuta después del handler actual,
      // antes del siguiente render. Rápido, no bloquea.
      runAsMicrotask(() => {
        countWords(newContent);
      });

      if (mode === 'naive') {
        // MODO INGENUDO: spell check SÍNCRONO en el hilo principal.
        // Bloquea el render. web-vitals capturará esto como INP alto.
        store.setSpellCheckStatus('checking');
        const result = detectMisspelled(newContent, DICTIONARY_WORDS);
        logSpellCheckResult(result);
        store.setSpellCheckStatus('done');
      } else {
        // MODO OPTIMIZADO: spell check en Web Worker (hilo separado).
        // El main thread queda libre. web-vitals capturará INP bajo.
        store.setSpellCheckStatus('checking');
        runSpellCheckInWorker(newContent)
          .then((result) => {
            logSpellCheckResult(result);
            store.setSpellCheckStatus('done');
          })
          .catch((error: unknown) => {
            console.error('[SpellCheck Worker] Error:', error);
            store.setSpellCheckStatus('done');
          });
      }
    },
    [store, runSpellCheckInWorker],
  );

  return {
    content: store.content,
    mode: store.mode,
    saveStatus: store.saveStatus,
    metrics: store.metrics,
    spellCheckStatus: store.spellCheckStatus,
    version: store.version,
    handleInput,
    setMode: store.setMode,
    resetMetrics: store.resetMetrics,
  };
}

function logSpellCheckResult(result: SpellCheckResult): void {
  console.log(
    `[SpellCheck] ${result.wordsChecked} palabras revisadas, ` +
      `${result.misspelled.length} errores encontrados en ${result.checkDurationMs.toFixed(1)}ms`,
  );
}
