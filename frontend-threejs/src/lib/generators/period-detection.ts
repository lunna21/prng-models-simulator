export interface PeriodDetectionResult {
  period: number | null;
  cycleStart: number | null;
  hasCycle: boolean;
}

export function detectPeriod(values: number[]): PeriodDetectionResult {
  if (values.length < 2) {
    return { period: null, cycleStart: null, hasCycle: false };
  }

  const firstSeenIndex = new Map<number, number>();

  for (let i = 0; i < values.length; i++) {
    const current = values[i];
    const start = firstSeenIndex.get(current);

    if (start === undefined) {
      firstSeenIndex.set(current, i);
      continue;
    }

    const period = i - start;
    if (period <= 0) continue;

    let isConsistentCycle = true;
    for (let j = start; j + period < values.length; j++) {
      if (values[j] !== values[j + period]) {
        isConsistentCycle = false;
        break;
      }
    }

    if (isConsistentCycle) {
      return {
        period,
        cycleStart: start,
        hasCycle: true,
      };
    }

    firstSeenIndex.set(current, i);
  }

  return { period: null, cycleStart: null, hasCycle: false };
}

export function findRepetition(values: number[]): { index: number; value: number } | null {
  const seen = new Map<number, number>();

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (seen.has(value)) {
      return { index: i, value };
    }
    seen.set(value, i);
  }

  return null;
}
