import type { WordCountResult } from '../../shared/types';

/**
 * Crea un resultado de conteo de palabras.
 * Factory function para mantener consistencia.
 */
export function createWordCountResult(
  words: number,
  characters: number,
  charactersNoSpaces: number,
): WordCountResult {
  return { words, characters, charactersNoSpaces };
}
