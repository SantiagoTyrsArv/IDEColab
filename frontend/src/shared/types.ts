/** Modo de ejecución del editor: ingenuo (todo sincrónico) u optimizado (distribuido) */
export type ExecutionMode = 'naive' | 'optimized';

/** Resultado del conteo de palabras */
export interface WordCountResult {
  readonly words: number;
  readonly characters: number;
  readonly charactersNoSpaces: number;
}

/** Palabra detectada como mal ortografiada */
export interface MisspelledWord {
  readonly word: string;
  readonly position: number;
  readonly suggestions: readonly string[];
}

/** Resultado del chequeo ortográfico */
export interface SpellCheckResult {
  readonly misspelled: readonly MisspelledWord[];
  readonly checkDurationMs: number;
  readonly wordsChecked: number;
}

/** Documento del editor */
export interface Document {
  readonly id: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

/** Resultado de guardado */
export interface SaveResult {
  readonly success: boolean;
  readonly savedAt: Date;
  readonly documentId: string;
}

/** Resultado de sincronización */
export interface SyncResult {
  readonly remoteVersion: Document;
  readonly lastSyncedAt: Date;
  readonly conflicts: readonly Conflict[];
}

/** Conflicto de sincronización */
export interface Conflict {
  readonly field: string;
  readonly localValue: string;
  readonly remoteValue: string;
}

/** Métricas de INP para una interacción */
export interface INPMetricData {
  readonly value: number;
  readonly inputDelay: number;
  readonly processingDuration: number;
  readonly presentationDelay: number;
  readonly interactionType: string;
  readonly interactionTarget: string;
  readonly timestamp: number;
}

/** Entrada de long task detectada */
export interface LongTaskEntry {
  readonly duration: number;
  readonly startTime: number;
  readonly entryType: string;
}

/** Estado del panel de métricas */
export interface MetricsState {
  readonly currentINP: number;
  readonly worstINP: number;
  readonly inpBreakdown: {
    readonly inputDelay: number;
    readonly processingDuration: number;
    readonly presentationDelay: number;
  } | null;
  readonly longTaskCount: number;
  readonly longTasks: readonly LongTaskEntry[];
  readonly inpHistory: readonly { value: number; timestamp: number; mode: ExecutionMode }[];
}
