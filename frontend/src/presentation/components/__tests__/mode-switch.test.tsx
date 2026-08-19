import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSwitch } from '../mode/mode-switch';

describe('ModeSwitch', () => {
  it('debería renderizar ambos botones de modo', () => {
    render(<ModeSwitch mode="naive" onModeChange={() => {}} />);
    expect(screen.getByRole('button', { name: /ingenuo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /optimizado/i })).toBeInTheDocument();
  });

  it('debería mostrar el modo activo con aria-pressed', () => {
    render(<ModeSwitch mode="naive" onModeChange={() => {}} />);
    expect(screen.getByRole('button', { name: /ingenuo/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /optimizado/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('debería llamar onModeChange al hacer clic', () => {
    const handleChange = vi.fn();
    render(<ModeSwitch mode="naive" onModeChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /optimizado/i }));
    expect(handleChange).toHaveBeenCalledWith('optimized');
  });

  it('debería mostrar la descripción del modo ingenuo', () => {
    render(<ModeSwitch mode="naive" onModeChange={() => {}} />);
    expect(screen.getByText(/Spell check corre en el hilo principal/)).toBeInTheDocument();
  });

  it('debería mostrar la descripción del modo optimizado', () => {
    render(<ModeSwitch mode="optimized" onModeChange={() => {}} />);
    expect(screen.getByText(/Web Worker \(hilo separado\)/)).toBeInTheDocument();
  });
});
