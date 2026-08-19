/**
 * Wrapper sobre requestIdleCallback con polyfill.
 *
 * **Por qué requestIdleCallback:** Se usa para trabajo de baja prioridad
 * que solo debe ejecutarse cuando el navegador está idle (sin frame
 * pending). Ideal para tareas como enviar métricas, limpiar caches, etc.
 *
 * **Limitación:** requestIdleCallback tiene un timeout máximo de ~50ms
 * en Chrome. Para trabajo más largo, se debe dividir en chunks.
 *
 * @param fn - Función a ejecutar cuando el navegador esté idle
 * @param timeout - Tiempo máximo de espera en ms (por defecto 5000)
 * @returns ID del request para poder cancelarlo
 */
export function runWhenIdle(fn: (deadline: IdleDeadline) => void, timeout: number = 5000): number {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(fn, { timeout });
  }

  // Fallback: ejecutar en la siguiente macrotarea
  const id = setTimeout(() => {
    fn({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 0) as unknown as number;

  return id;
}

/** Interfaz para el deadline de requestIdleCallback */
interface IdleDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}
