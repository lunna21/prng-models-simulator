/**
 * Kolmogorov-Smirnov Test
 *
 * Computes the maximum deviation between the empirical CDF
 * of the sample and the theoretical uniform CDF on [0,1).
 */

import type { TestResult, KSDetails } from './types';

// K-S critical values at alpha = 0.05 for small n
const KS_TABLE_005: Record<number, number> = {
  1: 0.975, 2: 0.842, 3: 0.708, 4: 0.624, 5: 0.565,
  6: 0.521, 7: 0.486, 8: 0.457, 9: 0.432, 10: 0.410,
  11: 0.391, 12: 0.375, 13: 0.361, 14: 0.349, 15: 0.338,
  16: 0.328, 17: 0.318, 18: 0.309, 19: 0.301, 20: 0.294,
  25: 0.264, 30: 0.242, 35: 0.224,
};

function getKSCritical(n: number): number {
  if (KS_TABLE_005[n] !== undefined) return KS_TABLE_005[n];

  // For n > 35, use asymptotic approximation
  if (n > 35) return 1.36 / Math.sqrt(n);

  // Interpolate for intermediate small values
  const keys = Object.keys(KS_TABLE_005).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (n > keys[i] && n < keys[i + 1]) {
      const ratio = (n - keys[i]) / (keys[i + 1] - keys[i]);
      return KS_TABLE_005[keys[i]] + ratio * (KS_TABLE_005[keys[i + 1]] - KS_TABLE_005[keys[i]]);
    }
  }

  return 1.36 / Math.sqrt(n);
}

export function ksTest(values: number[]): TestResult {
  if (values.length === 0) {
    throw new Error('La secuencia no puede estar vacía.');
  }

  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);

  let dPlus = 0;
  let dMinus = 0;

  for (let i = 0; i < n; i++) {
    const empiricalCDF = (i + 1) / n;
    const theoreticalCDF = sorted[i];

    const dp = empiricalCDF - theoreticalCDF;
    const dm = theoreticalCDF - i / n;

    dPlus = Math.max(dPlus, dp);
    dMinus = Math.max(dMinus, dm);
  }

  const maxDeviation = Math.max(dPlus, dMinus);
  const criticalValue = getKSCritical(n);
  const pass = maxDeviation <= criticalValue;

  const details: KSDetails = {
    n,
    dPlus: Math.round(dPlus * 10000) / 10000,
    dMinus: Math.round(dMinus * 10000) / 10000,
    maxDeviation: Math.round(maxDeviation * 10000) / 10000,
    sortedValues: sorted,
  };

  return {
    statistic: Math.round(maxDeviation * 10000) / 10000,
    criticalValue: Math.round(criticalValue * 10000) / 10000,
    pass,
    testName: 'Kolmogorov-Smirnov',
    details,
  };
}
