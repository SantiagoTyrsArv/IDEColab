import { describe, it, expect } from 'vitest';
import {
  updateMetricsWithINP,
  updateMetricsWithLongTask,
  INITIAL_METRICS_STATE,
} from '../metrics';
import type { INPMetricData, LongTaskEntry } from '../../../shared/types';

describe('metrics entities', () => {
  describe('updateMetricsWithINP', () => {
    it('debería actualizar el INP actual', () => {
      const metric: INPMetricData = {
        value: 150,
        inputDelay: 30,
        processingDuration: 80,
        presentationDelay: 40,
        interactionType: 'pointer',
        interactionTarget: '#editor',
        timestamp: performance.now(),
      };

      const newState = updateMetricsWithINP(INITIAL_METRICS_STATE, metric, 'naive');
      expect(newState.currentINP).toBe(150);
      expect(newState.worstINP).toBe(150);
      expect(newState.inpBreakdown).not.toBeNull();
    });

    it('debería mantener el peor INP si el nuevo es menor', () => {
      const state1 = updateMetricsWithINP(
        INITIAL_METRICS_STATE,
        { value: 300 } as INPMetricData,
        'naive',
      );

      const state2 = updateMetricsWithINP(
        state1,
        { value: 100 } as INPMetricData,
        'naive',
      );

      expect(state2.worstINP).toBe(300);
      expect(state2.currentINP).toBe(100);
    });

    it('debería agregar al historial', () => {
      const state = updateMetricsWithINP(
        INITIAL_METRICS_STATE,
        { value: 100, timestamp: 1000 } as INPMetricData,
        'naive',
      );

      expect(state.inpHistory.length).toBe(1);
      expect(state.inpHistory[0].mode).toBe('naive');
    });
  });

  describe('updateMetricsWithLongTask', () => {
    it('debería agregar long tasks al estado', () => {
      const entry: LongTaskEntry = {
        duration: 75,
        startTime: performance.now(),
        entryType: 'longtask',
      };

      const newState = updateMetricsWithLongTask(
        INITIAL_METRICS_STATE,
        entry,
        10_000,
      );

      expect(newState.longTaskCount).toBe(1);
    });

    it('debería filtrar tasks antiguas fuera de la ventana', () => {
      const oldEntry: LongTaskEntry = {
        duration: 60,
        startTime: performance.now() - 15_000, // fuera de la ventana de 10s
        entryType: 'longtask',
      };

      const state = updateMetricsWithLongTask(
        INITIAL_METRICS_STATE,
        oldEntry,
        10_000,
      );

      // La task antigua se filtra porque está fuera de la ventana
      expect(state.longTaskCount).toBe(0);
    });
  });
});
