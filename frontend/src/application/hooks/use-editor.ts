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
 * 2. Orquestar countWords (microtarea) y spellCheck (Worker o síncrono según modo)
 * 3. Iniciar tracking de métricas (INP + long tasks)
 * 4. Alternar entre modo ingenuo y optimizado
 *
 * **Por qué en application/hooks:** este hook es la "cola orchestradora"
 * que conecta la capa de presentación (React) con el dominio (casos de uso puros)
 * y la infraestructure (scheduling, workers, metrics). No contiene lógica de
 * negocio, solo orquestación.
 */
export function useEditor() {
  const store = useEditorStore();
  const spellCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (spellCheckTimerRef.current) {
        clearTimeout(spellCheckTimerRef.current);
      }
      // Terminar el Web Worker al desmontar para evitar fugas de memoria
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Obtiene o crea el Web Worker de spell check.
   * Se reutiliza la misma instancia para evitar costos de creación.
   */
  const getSpellCheckWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new SpellCheckWorker();
    }
    return workerRef.current;
  }, []);

  /**
   * Ejecuta el spell check en un Web Worker (modo optimizado).
   * Devuelve una Promise que se resuelve con el resultado.
   *
   * **Event Loop:** El Worker corre en un hilo separado del navegador.
   * Los mensajes postMessage se encolan como macrotareas en ambos lados.
   * El hilo principal queda libre para pintar frames y responder inputs.
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
   * Actualiza el contenido y dispara conteo de palabras como microtarea.
   */
  const handleInput = useCallback((newContent: string) => {
    store.setContent(newContent);
    store.setSaveStatus('editing');

    // Microtarea: countWords se ejecuta después del handler actual,
    // antes del siguiente render. Esto mantiene el contador sincronizado
    // sin causar un frame intermedio con valor desactualizado.
    runAsMicrotask(() => {
      const result = countWords(newContent);
      // Actualizar el store con el resultado del conteo
      store.setContent(newContent);
      void result;
    });
  }, [store]);

  /**
   * Dispara el chequeo ortográfico según el modo actual.
   *
   * **Modo ingenuo:** detectMisspelled corre SÍNCRONAMENTE en el hilo principal.
   * Esto bloquea el render y causa long tasks medibles.
   *
   * **Modo optimizado:** detectMisspelled corre en un Web Worker (hilo separado).
   * El hilo principal queda libre, no hay long tasks, y el INP mejora.
   */
  const triggerSpellCheck = useCallback((text: string, mode: ExecutionMode) => {
    // Limpiar timer anterior
    if (spellCheckTimerRef.current) {
      clearTimeout(spellCheckTimerRef.current);
    }

    if (mode === 'naive') {
      // MODO INGENUDO: todo corre en el hilo principal, bloqueando el render.
      // El usuario experimentará lag perceptible mientras se ejecuta detectMisspelled.
      store.setSpellCheckStatus('checking');
      const result = detectMisspelled(text, DICTIONARY_WORDS);
      logSpellCheckResult(result);
      store.setSpellCheckStatus('done');
    } else {
      // MODO OPTIMIZADO: el trabajo pesado se delega al Web Worker.
      // El Worker corre en un hilo separado del navegador, sin bloquear
      // el hilo principal ni impedir que React pinte frames.
      store.setSpellCheckStatus('checking');

      runSpellCheckInWorker(text)
        .then((result) => {
          logSpellCheckResult(result);
          store.setSpellCheckStatus('done');
        })
        .catch((error: unknown) => {
          console.error('[SpellCheck Worker] Error:', error);
          store.setSpellCheckStatus('done');
        });
    }
  }, [store, runSpellCheckInWorker]);

  /**
   * Maneja el debounce para spell check.
   * Se ejecuta 600ms después del último input para no sobrecargar.
   */
  const handleDebouncedSpellCheck = useCallback((text: string, mode: ExecutionMode) => {
    if (spellCheckTimerRef.current) {
      clearTimeout(spellCheckTimerRef.current);
    }

    spellCheckTimerRef.current = setTimeout(() => {
      triggerSpellCheck(text, mode);
    }, 600);
  }, [triggerSpellCheck]);

  return {
    content: store.content,
    mode: store.mode,
    saveStatus: store.saveStatus,
    metrics: store.metrics,
    spellCheckStatus: store.spellCheckStatus,
    version: store.version,
    handleInput,
    handleDebouncedSpellCheck,
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
