/**
 * Multiplicative Congruential Generator (MCG)
 * Formula: X(n+1) = (a * X(n)) mod m
 */

import type { GeneratorResult, MCGParams, StepDetail } from './types';

export function generate(params: MCGParams): GeneratorResult {
  const { seed, a, m, count } = params;

  if (m <= 0) throw new Error('El módulo m debe ser un entero positivo mayor que 0.');
  if (seed === 0) throw new Error('La semilla (X0) debe ser distinta de cero para el MCG.');
  if (count <= 0) throw new Error('La cantidad debe ser un entero positivo.');
  if (count > 10000) throw new Error('La cantidad no debe exceder 10,000.');

  let x = ((seed % m) + m) % m;
  if (x === 0) throw new Error('La semilla mod m debe ser distinta de cero para el MCG.');

  const sequence: number[] = [];
  const steps: StepDetail[] = [];

  for (let i = 0; i < count; i++) {
    const xPrev = x;
    const xNext = (a * xPrev) % m;
    const normalized = m > 0 ? xNext / m : 0;

    steps.push({
      iteration: i + 1,
      xPrev,
      formula: `(${a} × ${xPrev}) mod ${m}`,
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
