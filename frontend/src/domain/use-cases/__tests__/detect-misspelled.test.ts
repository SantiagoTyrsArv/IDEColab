import { describe, it, expect } from 'vitest';
import { detectMisspelled } from '../detect-misspelled';

describe('detectMisspelled', () => {
  const dictionary = ['hola', 'mundo', 'editor', 'texto', 'javascript'];

  it('debería detectar palabras mal ortografiadas', () => {
    const result = detectMisspelled('hola mndo', dictionary);
    expect(result.misspelled.length).toBe(1);
    expect(result.misspelled[0].word).toBe('mndo');
  });

  it('debería devolver vacío para texto correcto', () => {
    const result = detectMisspelled('hola mundo', dictionary);
    expect(result.misspelled.length).toBe(0);
  });

  it('debería manejar texto vacío', () => {
    const result = detectMisspelled('', dictionary);
    expect(result.misspelled.length).toBe(0);
    expect(result.wordsChecked).toBe(0);
  });

  it('debería reportar la duración del chequeo', () => {
    const result = detectMisspelled('hola', dictionary);
    expect(result.checkDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('debería contar las palabras revisadas', () => {
    const result = detectMisspelled('hola mundo editor', dictionary);
    expect(result.wordsChecked).toBe(3);
  });

  it('debería ser case-insensitive', () => {
    const result = detectMisspelled('HOLA', dictionary);
    expect(result.misspelled.length).toBe(0);
  });
});
