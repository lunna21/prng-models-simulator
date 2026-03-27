/**
 * Distribution utilities for queue simulation
 */

import type { DistributionMode } from './types';

/**
 * Exponential inverse transform: generates exponential variate from uniform U
 * Formula: X = -ln(1 - U) / rate
 */
export function exponentialInverseTransform(u: number, rate: number): number {
  if (rate <= 0) throw new Error('La tasa debe ser positiva.');
  // Clamp u to avoid log(0)
  const clamped = Math.max(1e-10, Math.min(u, 1 - 1e-10));
  return -Math.log(1 - clamped) / rate;
}

/**
 * Table-based (discrete) mapping: given a random number and a lookup table,
 * return the corresponding mapped value.
 */
export interface TableEntry {
  from: number;
  to: number;
  value: number;
}

export function tableLookup(u: number, table: TableEntry[]): number {
  for (const entry of table) {
    if (u >= entry.from && u < entry.to) {
      return entry.value;
    }
  }
  // Default to last entry value
  return table[table.length - 1]?.value ?? 0;
}

/**
 * Generate a time value from a PRNG output based on the distribution mode
 */
export function generateTime(
  u: number,
  rate: number,
  mode: DistributionMode,
  table?: TableEntry[]
): number {
  if (mode === 'exponential') {
    return exponentialInverseTransform(u, rate);
  }
  if (table && table.length > 0) {
    return tableLookup(u, table);
  }
  // Fallback to exponential
  return exponentialInverseTransform(u, rate);
}

/**
 * Default arrival time table
 */
export function getDefaultArrivalTable(): TableEntry[] {
  return [
    { from: 0.0, to: 0.2, value: 2 },
    { from: 0.2, to: 0.5, value: 3 },
    { from: 0.5, to: 0.8, value: 4 },
    { from: 0.8, to: 1.0, value: 5 },
  ];
}

/**
 * Default service time table
 */
export function getDefaultServiceTable(): TableEntry[] {
  return [
    { from: 0.0, to: 0.2, value: 2 },
    { from: 0.2, to: 0.4, value: 3 },
    { from: 0.4, to: 0.6, value: 4 },
    { from: 0.6, to: 0.8, value: 5 },
    { from: 0.8, to: 1.0, value: 6 },
  ];
}
