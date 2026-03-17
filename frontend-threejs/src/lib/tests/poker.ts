/**
 * Poker Test
 *
 * Groups normalized values into 5-digit "hands" by extracting
 * the first decimal digit of each value. Classifies hands by
 * pattern and runs a chi-square test on the observed vs expected frequencies.
 */

import type { TestResult, PokerDetails, PokerHandCount } from './types';

// Hand categories for poker test with d=10 digits, r=5 positions
// Probabilities calculated for digits 0-9 with 5 positions
const HAND_CATEGORIES = [
  { name: 'Todos diferentes (TD)', probability: 0.3024 },
  { name: 'Un par (1P)', probability: 0.504 },
  { name: 'Dos pares (2P)', probability: 0.108 },
  { name: 'Tercia (TP)', probability: 0.072 },
  { name: 'Full house (FH)', probability: 0.009 },
  { name: 'Póker (PK)', probability: 0.0045 },
  { name: 'Quintilla (QN)', probability: 0.0001 },
];

// Chi-square critical values at alpha=0.05
function getChi2Critical(df: number): number {
  const table: Record<number, number> = {
    1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
    6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919,
  };
  if (table[df]) return table[df];
  const z = 1.6449;
  const term = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df));
  return df * Math.pow(term, 3);
}

function classifyHand(digits: number[]): number {
  // Count frequency of each digit
  const freq = new Map<number, number>();
  for (const d of digits) {
    freq.set(d, (freq.get(d) || 0) + 1);
  }

  const counts = Array.from(freq.values()).sort((a, b) => b - a);
  const uniqueCount = counts.length;

  if (uniqueCount === 5) return 0; // All different
  if (uniqueCount === 4) return 1; // One pair
  if (uniqueCount === 3) {
    if (counts[0] === 3) return 3; // Three of a kind
    return 2; // Two pair
  }
  if (uniqueCount === 2) {
    if (counts[0] === 4) return 5; // Four of a kind
    return 4; // Full house
  }
  return 6; // Five of a kind (quintilla)
}

export function pokerTest(values: number[]): TestResult {
  if (values.length < 5) {
    throw new Error('Se necesitan al menos 5 valores para la prueba de póker.');
  }

  // Group into hands of 5
  const handSize = 5;
  const totalHands = Math.floor(values.length / handSize);

  if (totalHands === 0) {
    throw new Error('No hay suficientes valores para formar manos de póker.');
  }

  // Count observed hand types
  const observed = new Array(HAND_CATEGORIES.length).fill(0);

  for (let h = 0; h < totalHands; h++) {
    const hand: number[] = [];
    for (let i = 0; i < handSize; i++) {
      const val = values[h * handSize + i];
      // Extract first decimal digit: floor(val * 10) mod 10
      const digit = Math.floor(val * 10) % 10;
      hand.push(digit);
    }
    const category = classifyHand(hand);
    observed[category]++;
  }

  // Compute expected frequencies and chi-square
  const expected = HAND_CATEGORIES.map((c) => c.probability * totalHands);

  // Merge categories with expected < 5 into last valid category
  // (standard practice for chi-square validity)
  const mergedObserved: number[] = [];
  const mergedExpected: number[] = [];
  const mergedNames: string[] = [];

  let accumObs = 0;
  let accumExp = 0;
  let accumNames: string[] = [];

  for (let i = 0; i < HAND_CATEGORIES.length; i++) {
    accumObs += observed[i];
    accumExp += expected[i];
    accumNames.push(HAND_CATEGORIES[i].name);

    if (accumExp >= 5 || i === HAND_CATEGORIES.length - 1) {
      mergedObserved.push(accumObs);
      mergedExpected.push(accumExp);
      mergedNames.push(accumNames.join(' + '));
      accumObs = 0;
      accumExp = 0;
      accumNames = [];
    }
  }

  // If last merged category still has accumulation pending
  if (accumExp > 0) {
    if (mergedExpected.length > 0) {
      mergedObserved[mergedObserved.length - 1] += accumObs;
      mergedExpected[mergedExpected.length - 1] += accumExp;
      mergedNames[mergedNames.length - 1] += ' + ' + accumNames.join(' + ');
    } else {
      mergedObserved.push(accumObs);
      mergedExpected.push(accumExp);
      mergedNames.push(accumNames.join(' + '));
    }
  }

  let chiSquare = 0;
  for (let i = 0; i < mergedObserved.length; i++) {
    if (mergedExpected[i] > 0) {
      chiSquare += Math.pow(mergedObserved[i] - mergedExpected[i], 2) / mergedExpected[i];
    }
  }

  const df = Math.max(mergedObserved.length - 1, 1);
  const criticalValue = getChi2Critical(df);
  const pass = chiSquare <= criticalValue;

  const handCounts: PokerHandCount[] = HAND_CATEGORIES.map((cat, i) => ({
    name: cat.name,
    observed: observed[i],
    expected: Math.round(expected[i] * 10000) / 10000,
    probability: cat.probability,
  }));

  const details: PokerDetails = {
    totalHands,
    handCounts,
    chiSquareStatistic: Math.round(chiSquare * 10000) / 10000,
    chiSquareCritical: Math.round(criticalValue * 10000) / 10000,
    degreesOfFreedom: df,
  };

  return {
    statistic: Math.round(chiSquare * 10000) / 10000,
    criticalValue: Math.round(criticalValue * 10000) / 10000,
    pass,
    testName: 'Prueba de Póker',
    details,
  };
}
