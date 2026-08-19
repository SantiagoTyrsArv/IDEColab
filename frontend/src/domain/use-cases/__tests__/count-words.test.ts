import { describe, it, expect } from 'vitest';
import { countWords } from '../count-words';

describe('countWords', () => {
  it('debería contar palabras correctamente en un texto simple', () => {
    const result = countWords('hola mundo');
    expect(result.words).toBe(2);
    expect(result.characters).toBe(10);
    expect(result.charactersNoSpaces).toBe(9);
  });

  it('debería manejar texto vacío', () => {
    const result = countWords('');
    expect(result.words).toBe(0);
    expect(result.characters).toBe(0);
    expect(result.charactersNoSpaces).toBe(0);
  });

  it('debería manejar solo espacios', () => {
    const result = countWords('   ');
    expect(result.words).toBe(0);
  });

  it('debería contar caracteres con espacios correctamente', () => {
    const result = countWords('a b c');
    expect(result.words).toBe(3);
    expect(result.characters).toBe(5);
    expect(result.charactersNoSpaces).toBe(3);
  });

  it('debería manejar múltiples espacios entre palabras', () => {
    const result = countWords('hola   mundo   cruel');
    expect(result.words).toBe(3);
  });

  it('debería manejar texto con saltos de línea', () => {
    const result = countWords('hola\nmundo');
    expect(result.words).toBe(2);
  });
});
