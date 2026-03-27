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
  const { seed, iterations, d } = params;

  if (seed < 0) throw new Error('La semilla debe ser un entero no negativo.');
  if (iterations <= 0) throw new Error('Las iteraciones deben ser un entero positivo.');
  if (iterations > 10000) throw new Error('Las iteraciones no deben exceder 10,000.');
  if (d < 2) throw new Error('El número de dígitos d debe ser al menos 2.');
  if (seed >= Math.pow(10, d)) {
    throw new Error(`La semilla no puede tener más de ${d} dígitos.`);
  }

  const maxVal = Math.pow(10, d);
  const midStart = Math.floor(d / 2);

  const sequence: number[] = [];
  const steps: MiddleSquareStepDetail[] = [];
  const seen = new Set<number>();
  let x = seed;

  for (let i = 0; i < iterations; i++) {
    const xPrev = x;
    const squared = xPrev * xPrev;
    const padded = String(squared).padStart(2 * d, '0');
    const leftPart = padded.substring(0, midStart);
    const extracted = padded.substring(midStart, midStart + d);
    const rightPart = padded.substring(midStart + d);
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
      leftPart,
      rightPart,
    });

    sequence.push(xNext);

    // Degeneration detection
    if (xNext === 0) {
      return {
        sequence,
        steps,
        normalized: sequence.map((v) => Math.round((v / maxVal) * 1000000) / 1000000),
        digits: d,
        degenerated: { iteration: i + 1, reason: 'zero', value: 0 },
      };
    }
    if (seen.has(xNext)) {
      return {
        sequence,
        steps,
        normalized: sequence.map((v) => Math.round((v / maxVal) * 1000000) / 1000000),
        digits: d,
        degenerated: { iteration: i + 1, reason: 'cycle', value: xNext },
      };
    }
    seen.add(xNext);
    x = xNext;
  }

  return {
    sequence,
    steps,
    normalized: sequence.map((v) => Math.round((v / maxVal) * 1000000) / 1000000),
    digits: d,
    degenerated: null,
  };
}
