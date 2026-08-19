import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LongTaskCounter } from '../metrics/long-task-counter';

describe('LongTaskCounter', () => {
  it('debería mostrar 0 long tasks cuando no hay', () => {
    render(<LongTaskCounter count={0} recentTasks={[]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/en los últimos 10s/)).toBeInTheDocument();
  });

  it('debería mostrar el conteo de long tasks', () => {
    render(
      <LongTaskCounter
        count={3}
        recentTasks={[
          { duration: 75, startTime: 1000, entryType: 'longtask' },
          { duration: 120, startTime: 2000, entryType: 'longtask' },
          { duration: 60, startTime: 3000, entryType: 'longtask' },
        ]}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('debería usar clase roja cuando hay long tasks', () => {
    render(
      <LongTaskCounter
        count={1}
        recentTasks={[{ duration: 80, startTime: 1000, entryType: 'longtask' }]}
      />,
    );
    expect(screen.getByText('1')).toHaveClass('text-metrics-bad');
  });

  it('debería usar clase verde cuando no hay long tasks', () => {
    render(<LongTaskCounter count={0} recentTasks={[]} />);
    expect(screen.getByText('0')).toHaveClass('text-metrics-good');
  });
});
