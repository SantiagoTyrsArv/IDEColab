import type { SpellCheckResult, MisspelledWord } from '../../shared/types';

/**
 * Web Worker para chequeo ortográfico.
 *
 * **Por qué Worker:** El chequeo ortográfico es intencionalmente costoso
 * (O(n*m) + trabajo CPU simulado). Al ejecutarlo en un Worker, corre en
 * un hilo separado del navegador, sin bloquear el hilo principal ni
 * impedir que React pinte frames ni que el usuario siga escribiendo.
 *
 * **Protocolo de mensajes:**
 * - Recibe: { text: string, dictionary: string[] }
 * Devuelve: SpellCheckResult
 *
 * **Event Loop:** El Worker tiene su propio event loop. Los mensajes
 * entre el hilo principal y el Worker se encolan como macrotareas.
 * El worker no tiene acceso al DOM.
 */

interface WorkerMessage {
  type: 'check';
  text: string;
  dictionary: readonly string[];
}

interface WorkerResponse {
  type: 'result';
  result: SpellCheckResult;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { text, dictionary } = event.data;
  const result = runSpellCheck(text, dictionary);

  const response: WorkerResponse = { type: 'result', result };
  self.postMessage(response);
};

function runSpellCheck(text: string, dictionary: readonly string[]): SpellCheckResult {
  const startTime = performance.now();

  if (!text || text.trim().length === 0) {
    return { misspelled: [], checkDurationMs: 0, wordsChecked: 0 };
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

    simulateCPUWork();
  }

  const duration = performance.now() - startTime;

  return {
    misspelled,
    checkDurationMs: duration,
    wordsChecked: words.length,
  };
}

function findCloseSuggestions(word: string, dictionary: readonly string[]): string[] {
  return dictionary
    .filter((dictWord) => {
      const distance = levenshteinDistance(word, dictWord.toLowerCase());
      return distance > 0 && distance <= 2;
    })
    .slice(0, 3);
}

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

function simulateCPUWork(): void {
  const iterations = 50_000;
  let dummy = 0;
  for (let i = 0; i < iterations; i++) {
    dummy += Math.sqrt(i);
  }
  void dummy;
}

export {};
