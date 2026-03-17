/**
 * Linear Congruential Generator (LCG)
 * Formula: X(n+1) = (a * X(n) + c) mod m
 */

import type { GeneratorResult, LCGParams, StepDetail } from './types';

export function generate(params: LCGParams): GeneratorResult {
  const { seed, a, c, m, count } = params;

  if (m <= 0) throw new Error('El módulo m debe ser un entero positivo mayor que 0.');
  if (count <= 0) throw new Error('La cantidad debe ser un entero positivo.');
  if (count > 10000) throw new Error('La cantidad no debe exceder 10,000.');

  const sequence: number[] = [];
  const steps: StepDetail[] = [];
  let x = ((seed % m) + m) % m; // ensure non-negative

  for (let i = 0; i < count; i++) {
    const xPrev = x;
    const xNext = (a * xPrev + c) % m;
    const normalized = m > 0 ? xNext / m : 0;

    steps.push({
      iteration: i + 1,
      xPrev,
      formula: `(${a} × ${xPrev} + ${c}) mod ${m}`,
      xNext,
      normalized: Math.round(normalized * 1000000) / 1000000,
    });

    sequence.push(xNext);
    x = xNext;
  }

  return {
    sequence,
    steps,
    normalized: sequence.map((v) => Math.round((v / m) * 1000000) / 1000000),
  };
}
