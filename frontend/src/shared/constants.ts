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
 * En producción (servicio único): '' — relativo al mismo origen.
 * fetch('/api/documents') → https://mi-app.onrender.com/api/documents
 *
 * En desarrollo con backend separado: configurar VITE_API_URL=http://localhost:3001
 * fetch('http://localhost:3001/api/documents')
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
