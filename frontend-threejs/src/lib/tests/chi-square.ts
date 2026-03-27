/**
 * Chi-Square Goodness-of-Fit Test
 *
 * Divides [0,1) into k equal bins and compares observed vs expected frequencies.
 * H0: The sequence is uniformly distributed in [0,1).
 */

import type { TestResult, ChiSquareDetails } from './types';

// Chi-square critical values at alpha = 0.05 for df = 1..100
const CHI2_TABLE_005: Record<number, number> = {
  1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
  6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307,
  11: 19.675, 12: 21.026, 13: 22.362, 14: 23.685, 15: 24.996,
  16: 26.296, 17: 27.587, 18: 28.869, 19: 30.144, 20: 31.410,
  21: 32.671, 22: 33.924, 23: 35.172, 24: 36.415, 25: 37.652,
  26: 38.885, 27: 40.113, 28: 41.337, 29: 42.557, 30: 43.773,
  40: 55.758, 50: 67.505, 60: 79.082, 70: 90.531, 80: 101.879,
  90: 113.145, 100: 124.342,
};

function getChi2Critical(df: number): number {
  if (CHI2_TABLE_005[df] !== undefined) return CHI2_TABLE_005[df];

  // For intermediate values, find nearest or use approximation
  const keys = Object.keys(CHI2_TABLE_005).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df > keys[i] && df < keys[i + 1]) {
      // Linear interpolation
      const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return CHI2_TABLE_005[keys[i]] + ratio * (CHI2_TABLE_005[keys[i + 1]] - CHI2_TABLE_005[keys[i]]);
    }
  }

  // Wilson-Hilferty approximation for large df
  const z = 1.6449; // z for alpha=0.05
  const term = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df));
  return df * Math.pow(term, 3);
}

export function chiSquareTest(values: number[], k: number = 10): TestResult {
  if (values.length === 0) {
    throw new Error('La secuencia no puede estar vacía.');
  }
  if (k <= 0) {
    throw new Error('El número de intervalos k debe ser positivo.');
  }

  const n = values.length;
  const expectedPerBin = n / k;

  // Count observed frequencies per bin
  const observed = new Array(k).fill(0);
  for (const v of values) {
    const bin = Math.min(Math.floor(v * k), k - 1);
    observed[bin]++;
  }

  // Compute chi-square statistic
  const contributions = observed.map((o) => {
    return Math.pow(o - expectedPerBin, 2) / expectedPerBin;
  });
  const statistic = contributions.reduce((sum, c) => sum + c, 0);

  const df = k - 1;
  const criticalValue = getChi2Critical(df);
  const pass = statistic <= criticalValue;

  const details: ChiSquareDetails = {
    bins: k,
    observed,
    expected: new Array(k).fill(expectedPerBin),
    contributions,
    degreesOfFreedom: df,
  };

  return {
    statistic: Math.round(statistic * 10000) / 10000,
    criticalValue: Math.round(criticalValue * 10000) / 10000,
    pass,
    testName: 'Chi-Cuadrada (χ²)',
    details,
  };
}
