/** Documento del editor (compatibilidad con frontend) */
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
