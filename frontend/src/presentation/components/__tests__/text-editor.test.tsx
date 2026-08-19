import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextEditor } from '../editor/text-editor';

describe('TextEditor', () => {
  it('debería renderizar el textarea', () => {
    render(<TextEditor value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('debería mostrar el valor proporcionado', () => {
    render(<TextEditor value="Hola mundo" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Hola mundo');
  });

  it('debería llamar onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<TextEditor value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'nuevo texto' },
    });

    expect(handleChange).toHaveBeenCalledWith('nuevo texto');
  });

  it('debería tener aria-label descriptivo', () => {
    render(<TextEditor value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Editor de texto colaborativo')).toBeInTheDocument();
  });

  it('debería estar deshabilitado cuando disabled es true', () => {
    render(<TextEditor value="test" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
