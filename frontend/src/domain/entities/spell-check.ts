import type { SpellCheckResult, MisspelledWord } from '../../shared/types';

/**
 * Crea un resultado de chequeo ortográfico.
 */
export function createSpellCheckResult(
  misspelled: readonly MisspelledWord[],
  checkDurationMs: number,
  wordsChecked: number,
): SpellCheckResult {
  return { misspelled, checkDurationMs, wordsChecked };
}
