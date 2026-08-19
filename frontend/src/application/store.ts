import { create } from 'zustand';
import type { ExecutionMode, MetricsState } from '../shared/types';
import { INITIAL_METRICS_STATE } from '../domain/entities/metrics';

/** Store principal del editor — Zustand */
interface EditorState {
  /** Contenido actual del editor */
  content: string;
  /** Modo de ejecución */
  mode: ExecutionMode;
  /** Estado de autoguardado */
  saveStatus: 'idle' | 'editing' | 'saving' | 'saved' | 'error';
  /** ID del documento */
  documentId: string;
  /** Métricas de performance */
  metrics: MetricsState;
  /** Resultado del spell check */
  spellCheckStatus: 'idle' | 'checking' | 'done';
  /** Número de versión del documento */
  version: number;

  /** Acciones */
  setContent: (content: string) => void;
  setMode: (mode: ExecutionMode) => void;
  setSaveStatus: (status: EditorState['saveStatus']) => void;
  setMetrics: (metrics: MetricsState) => void;
  setSpellCheckStatus: (status: EditorState['spellCheckStatus']) => void;
  incrementVersion: () => void;
  resetMetrics: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  mode: 'naive',
  saveStatus: 'idle',
  documentId: 'doc-001',
  metrics: INITIAL_METRICS_STATE,
  spellCheckStatus: 'idle',
  version: 1,

  setContent: (content) => set({ content }),
  setMode: (mode) => set({ mode }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setMetrics: (metrics) => set({ metrics }),
  setSpellCheckStatus: (spellCheckStatus) => set({ spellCheckStatus }),
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
  resetMetrics: () => set({ metrics: INITIAL_METRICS_STATE }),
}));
