import { useCallback, useRef } from 'react';
import { useEditorStore } from '../../shared/store';
import { countWords } from '../../domain/use-cases/count-words';
import { detectMisspelled } from '../../domain/use-cases/detect-misspelled';
import { updateMetricsWithINP, updateMetricsWithLongTask } from '../../domain/entities/metrics';
import { runAsMicrotask } from '../../infrastructure/scheduling/microtask';
import { yieldToMain } from '../../infrastructure/scheduling/post-task';
import { trackINP } from '../../infrastructure/metrics/inp-tracker';
import { trackLongTasks } from '../../infrastructure/metrics/long-task-observer';
import { DICTIONARY_WORDS, LONG_TASK_WINDOW_MS } from '../../shared/constants';
import type { ExecutionMode, SpellCheckResult } from '../../shared/types';
import { useEffect } from 'react';

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
    };
  }, []);

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
      // El resultado se consume en el componente vía el store
      void result; // En un caso real, se guardaría en el store
    });
  }, [store]);

  /**
   * Dispara el chequeo ortográfico según el modo actual.
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
      // MODO OPTIMIZADO: usamos scheduler.yield para ceder el hilo
      // y luego ejecutamos el chequeo de forma que no bloquee.
      // En un caso real esto iría al Web Worker; aquí simulamos
      // la diferencia con yield.
      store.setSpellCheckStatus('checking');

      void (async () => {
        await yieldToMain(); // Ceder el hilo al navegador
        const result = detectMisspelled(text, DICTIONARY_WORDS);
        logSpellCheckResult(result);
        store.setSpellCheckStatus('done');
      })();
    }
  }, [store]);

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
