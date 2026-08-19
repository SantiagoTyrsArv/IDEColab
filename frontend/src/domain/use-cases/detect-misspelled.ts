import type { SpellCheckResult, MisspelledWord } from '../../shared/types';
import { createSpellCheckResult } from '../entities/spell-check';

/**
 * Caso de uso: detectar palabras mal ortografiadas en un texto.
 *
 * **Por qué está en domain:** la lógica de detección es independiente de
 * cómo se ejecuta (hilo principal vs Web Worker). La función pura vive aquí;
 * la decisión de DÓNDE ejecutarla está en infrastructure/scheduling.
 *
 * **Event Loop:** Esta función es intencionalmente costosa (O(n*m) donde
 * n = palabras del texto, m = tamaño del diccionario). En modo ingenuo,
 * bloquea el hilo principal causando long tasks. En modo optimizado,
 * se ejecuta en un Web Worker que corre en un hilo separado.
 *
 * @param text - Texto a analizar
 * @param dictionary - Lista de palabras correctas
 * @returns Resultado con palabras mal detectadas y duración del chequeo
 */
export function detectMisspelled(text: string, dictionary: readonly string[]): SpellCheckResult {
  const startTime = performance.now();

  if (!text || text.trim().length === 0) {
    return createSpellCheckResult([], 0, 0);
  }

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const dictionarySet = new Set(dictionary.map((w) => w.toLowerCase()));
  const misspelled: MisspelledWord[] = [];

  for (const word of words) {
    const cleaned = word.replace(/[^a-záéíóúñü]/gi, '');
    if (cleaned.length === 0) continue;

    if (!dictionarySet.has(cleaned)) {
      misspelled.push({
        word: cleaned,
        position: text.toLowerCase().indexOf(cleaned),
        suggestions: findCloseSuggestions(cleaned, dictionary),
      });
    }

    // Simular carga CPU intensiva: comparación adicional contra el diccionario
    simulateCPUWork();
  }

  const duration = performance.now() - startTime;

  return createSpellCheckResult(misspelled, duration, words.length);
}

/**
 * Encuentra sugerencias cercanas a la palabra mal ortografiada.
 * Usa distancia de edición simplificada.
 */
function findCloseSuggestions(word: string, dictionary: readonly string[]): string[] {
  return dictionary
    .filter((dictWord) => {
      const distance = levenshteinDistance(word, dictWord.toLowerCase());
      return distance > 0 && distance <= 2;
    })
    .slice(0, 3);
}

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 * Complejidad: O(n*m) — intencionalmente no optimizada para el caso educativo.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Simula trabajo CPU intensivo deliberadamente.
 * En producción esto sería un algoritmo real; aquí
 * existe para causar long tasks medibles en modo ingenuo.
 */
function simulateCPUWork(): void {
  const iterations = 50_000;
  let dummy = 0;
  for (let i = 0; i < iterations; i++) {
    dummy += Math.sqrt(i);
  }
  // Evitar dead code elimination
  void dummy;
}
