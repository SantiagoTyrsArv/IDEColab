import type { WordCountResult } from '../shared/types';

/**
 * Caso de uso: contar palabras y caracteres en un texto.
 *
 * **Por qué está en domain:** es lógica de negocio pura. No depende de React,
 * del DOM, ni de ninguna librería externa. Es fácil de testear.
 *
 * **Event Loop:** Esta función es puramente computacional. En modo ingenuo se
 * ejecuta síncrona en el hilo principal. En modo optimizado se ejecuta como
 * microtarea (queueMicrotask) para que se resuelva antes del siguiente render
 * pero sin bloquear el input del usuario.
 *
 * @param text - Texto a analizar
 * @returns Resultado con conteo de palabras, caracteres y caracteres sin espacios
 */
export function countWords(text: string): WordCountResult {
  if (!text || text.trim().length === 0) {
    return { words: 0, characters: 0, charactersNoSpaces: 0 };
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  return { words, characters, charactersNoSpaces };
}
