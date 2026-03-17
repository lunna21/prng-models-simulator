/**
 * Middle-Square Method
 * Algorithm:
 *   1. Square the seed
 *   2. Zero-pad to 2*d digits
 *   3. Extract the middle d digits
 *   4. Repeat
 */

import type { GeneratorResult, MiddleSquareParams, MiddleSquareStepDetail } from './types';

export function generate(params: MiddleSquareParams): GeneratorResult {
  const { seed, iterations } = params;

  if (seed < 0) throw new Error('La semilla debe ser un entero no negativo.');
  if (iterations <= 0) throw new Error('Las iteraciones deben ser un entero positivo.');
  if (iterations > 10000) throw new Error('Las iteraciones no deben exceder 10,000.');

  // Determine number of digits (at least 2)
  const d = Math.max(String(seed).length, 2);
  const maxVal = Math.pow(10, d);

  const sequence: number[] = [];
  const steps: MiddleSquareStepDetail[] = [];
  let x = seed;

  for (let i = 0; i < iterations; i++) {
    const xPrev = x;
    const squared = xPrev * xPrev;
    const padded = String(squared).padStart(2 * d, '0');
    const midStart = Math.floor(d / 2);
    const extracted = padded.substring(midStart, midStart + d);
    const xNext = parseInt(extracted, 10);
    const normalized = xNext / maxVal;

    steps.push({
      iteration: i + 1,
      xPrev,
      formula: `${xPrev}² = ${squared} → medio(${padded}) = ${extracted}`,
      xNext,
      normalized: Math.round(normalized * 1000000) / 1000000,
      squared,
      padded,
      extracted,
    });

    sequence.push(xNext);
    x = xNext;
  }

  return {
    sequence,
    steps,
    normalized: sequence.map((v) => Math.round((v / maxVal) * 1000000) / 1000000),
    digits: d,
  };
}
