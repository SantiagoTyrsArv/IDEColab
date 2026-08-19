import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { INPDisplay } from '../metrics/inp-display';

describe('INPDisplay', () => {
  it('debería mostrar INP actual y peor', () => {
    render(<INPDisplay currentINP={150} worstINP={300} breakdown={null} />);
    expect(screen.getByText('INP Actual')).toBeInTheDocument();
    expect(screen.getByText('Peor INP')).toBeInTheDocument();
  });

  it('debería mostrar el desglose cuando está disponible', () => {
    render(
      <INPDisplay
        currentINP={250}
        worstINP={400}
        breakdown={{
          inputDelay: 50,
          processingDuration: 150,
          presentationDelay: 50,
        }}
      />,
    );
    expect(screen.getByText('Input Delay')).toBeInTheDocument();
    expect(screen.getByText('Processing Duration')).toBeInTheDocument();
    expect(screen.getByText('Presentation Delay')).toBeInTheDocument();
  });

  it('debería clasificar INP < 200ms como bueno', () => {
    render(<INPDisplay currentINP={100} worstINP={100} breakdown={null} />);
    const inpValue = screen.getAllByText('100')[0];
    expect(inpValue).toHaveClass('text-metrics-good');
  });

  it('debería clasificar INP > 500ms como malo', () => {
    render(<INPDisplay currentINP={600} worstINP={600} breakdown={null} />);
    const inpValue = screen.getAllByText('600')[0];
    expect(inpValue).toHaveClass('text-metrics-bad');
  });
});
