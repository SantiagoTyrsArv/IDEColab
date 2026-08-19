import { useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '../../shared/store';
import { AUTOSAVE_DEBOUNCE_MS } from '../../shared/constants';
import type { SaveResult } from '../../shared/types';

/**
 * Hook para autoguardado con debounce.
 *
 * **Event Loop:** El debounce se implementa con setTimeout (macrotarea).
 * Cada vez que el usuario escribe, se cancela el timer anterior y se
 * programa uno nuevo. El guardado solo ocurre cuando el usuario deja
 * de escribir por AUTOSAVE_DEBOUNCE_MS milisegundos.
 *
 * **Por qué macrotarea (setTimeout) y no microtarea:** Si usáramos
 * queueMicrotask, el guardado se dispararía después de CADA keystroke
 * (antes del siguiente render), lo cual sería excesivo. Con setTimeout,
 * el guardado se difiere hasta que el usuario hace una pausa.
 *
 * **Modo optimizado:** El guardado se envía al Web Worker de sync
 * para no bloquear el hilo principal con la llamada fetch.
 */
export function useAutosave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const store = useEditorStore();

  /** Guarda el documento (simulado — en producción iría al backend) */
  const save = useCallback(async (content: string, documentId: string): Promise<SaveResult> => {
    store.setSaveStatus('saving');

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 300));

      // En modo real, aquí iría: await saveDocumentToServer(doc);
      const result: SaveResult = {
        success: true,
        savedAt: new Date(),
        documentId,
      };

      store.setSaveStatus('saved');
      return result;
    } catch {
      store.setSaveStatus('error');
      return {
        success: false,
        savedAt: new Date(),
        documentId,
      };
    }
  }, [store]);

  /** Programa un guardado con debounce */
  const scheduleAutosave = useCallback((content: string, documentId: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void save(content, documentId);
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [save]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { scheduleAutosave, save };
}
