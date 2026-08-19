/**
 * Wrapper sobre scheduler.postTask() con polyfill y feature detection.
 *
 * **Por qué macrotarea programada:** scheduler.postTask() permite al
 * navegador priorizar tareas. A diferencia de setTimeout, las tareas
 * postTask se ejecutan en una cola prioritizada. Ideal para trabajo
 * que no es urgente (como el autoguardado) pero tampoco trivial.
 *
 * **Polyfill:** Si el navegador no soporta scheduler.postTask(),
 * cae en setTimeout como fallback. La prioridad se pierde pero
 * el comportamiento funcional se mantiene.
 *
 * @param fn - Función a ejecutar
 * @param priority - Prioridad de la tarea (por defecto 'user-visible')
 * @returns Promise que se resuelve con el resultado
 */
export async function postTask<T>(
  fn: () => T,
  priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible',
): Promise<T> {
  if (typeof globalThis.scheduler !== 'undefined' && globalThis.scheduler.postTask) {
    return globalThis.scheduler.postTask(fn, { priority });
  }

  // Fallback: setTimeout simula una macrotarea
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(fn()), 0);
  });
}

/**
 * Wrapper sobre scheduler.yield() con polyfill.
 *
 * **Por qué yield:** scheduler.yield() pausa la ejecución actual y
 * reprograma la continuación como una tarea prioritaria. Esto permite
 * al navegador atender interacciones del usuario durante trabajo largo
 * (como el spell check). Es similar a "soltar el hilo" voluntariamente.
 *
 * **Diferencia con postTask:** yield() es para pausar una tarea en
 * progreso y continuar después; postTask() es para programar una
 * tarea nueva.
 *
 * @returns Promise que se resuelve cuando el navegador reanuda la ejecución
 */
export async function yieldToMain(): Promise<void> {
  if (typeof globalThis.scheduler !== 'undefined' && globalThis.scheduler.yield) {
    return globalThis.scheduler.yield();
  }

  // Fallback: yield a macrotarea via setTimeout
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}
