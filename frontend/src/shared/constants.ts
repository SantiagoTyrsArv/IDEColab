/** Tiempo de debounce para autoguardado en ms */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/** Umbral de long task en ms (medido por PerformanceObserver) */
export const LONG_TASK_THRESHOLD_MS = 50;

/** Ventana de tiempo para contar long tasks recientes en ms */
export const LONG_TASK_WINDOW_MS = 10_000;

/** ID del documento por defecto (simula un doc persistido) */
export const DEFAULT_DOCUMENT_ID = 'doc-001';

/**
 * URL base del backend.
 *
 * En producción (Vercel + Render): configurar VITE_API_URL en el dashboard
 * de Vercel apuntando a la URL de Render (ej. https://editor-colaborativo.onrender.com).
 *
 * En desarrollo: '' — relativo al mismo origen, o configurar
 * VITE_API_URL=http://localhost:3001 en .env.local si el backend corre por separado.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** Simulated dictionary para spellcheck (palabras comunes en español) */
export const DICTIONARY_WORDS = [
  'hola',
  'mundo',
  'editor',
  'texto',
  'colaborativo',
  'javascript',
  'evento',
  'bucle',
  'tarea',
  'microtarea',
  'render',
  'componente',
  'react',
  'typescript',
  'rendimiento',
  'medicion',
  'interaccion',
  'palabra',
  'oracion',
  'parrafo',
  'documento',
  'guardar',
  'sincronizar',
  'corrector',
  'ortografia',
  'error',
  'sugerencia',
  'detectar',
  'programacion',
  'aplicacion',
  'navegador',
  'servidor',
  'cliente',
];
