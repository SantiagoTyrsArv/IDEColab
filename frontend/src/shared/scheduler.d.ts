/**
 * Declaración de tipos para la Scheduler API del navegador.
 * TypeScript aún no incluye estos tipos nativamente.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API
 */

type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

interface SchedulerPostTaskOptions {
  priority?: TaskPriority;
  delay?: number;
  signal?: AbortSignal;
}

interface Scheduler {
  postTask<T>(callback: () => T, options?: SchedulerPostTaskOptions): Promise<T>;
  yield(): Promise<void>;
}

declare global {
  interface Window {
    scheduler: Scheduler;
  }

  var scheduler: Scheduler | undefined;
}

export {};
