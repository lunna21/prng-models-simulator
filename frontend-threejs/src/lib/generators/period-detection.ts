export interface PeriodDetectionResult {
  period: number | null;
  cycleStart: number | null;
  hasCycle: boolean;
}

export function detectPeriod(values: number[]): PeriodDetectionResult {
  if (values.length < 2) {
    return { period: null, cycleStart: null, hasCycle: false };
  }

  const n = values.length;
  const maxPeriod = Math.min(n, 10000);

  for (let period = 1; period <= maxPeriod; period++) {
    let match = true;
    const checkLength = Math.min(period, n - period);
    
    for (let i = 0; i < checkLength; i++) {
      if (Math.abs(values[i] - values[i + period]) > 0.0001) {
        match = false;
        break;
      }
    }

    if (match && checkLength > 0) {
      return {
        period,
        cycleStart: 0,
        hasCycle: true,
      };
    }
  }

  return { period: null, cycleStart: null, hasCycle: false };
}

export function findRepetition(values: number[]): { index: number; value: number } | null {
  const seen = new Map<number, number>();
  
  for (let i = 0; i < values.length; i++) {
    const rounded = Math.round(values[i] * 1000000);
    if (seen.has(rounded)) {
      return { index: seen.get(rounded)!, value: values[i] };
    }
    seen.set(rounded, i);
  }
  
  return null;
}
