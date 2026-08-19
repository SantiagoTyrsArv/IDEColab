/**
 * Wrapper sobre queueMicrotask para ejecutar trabajo como microtarea.
 *
 * **Por qué microtarea:** Las microtareas se ejecutan después del handler
 * actual pero ANTES de que el navegador pinte el siguiente frame. Esto
 * permite actualizar el contador de palabras inmediatamente después del
 * input, sin causar un parpadeo visible (el render de React se batchea).
 *
 * **Diferencia con macrotarea:** setTimeout (macrotarea) diffiere el
 * trabajo hasta después del siguiente render, lo que causaría un retraso
 * perceptible en el contador.
 *
 * @param fn - Función a ejecutar como microtarea
 */
export function runAsMicrotask(fn: () => void): void {
  queueMicrotask(fn);
}

/**
 * Wrapper que devuelve una Promise que se resuelve como microtarea.
 * Útil para encadenar con async/await.
 *
 * @param fn - Función a ejecutar
 * @returns Promise que se resuelve con el resultado de fn
 */
export function asMicrotask<T>(fn: () => T): Promise<T> {
  return Promise.resolve().then(fn);
}
