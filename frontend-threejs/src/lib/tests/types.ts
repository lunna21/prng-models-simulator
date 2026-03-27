export interface TestResult {
  statistic: number;
  criticalValue: number;
  pass: boolean;
  testName: string;
  details: ChiSquareDetails | KSDetails | PokerDetails;
}

export interface ChiSquareDetails {
  bins: number;
  observed: number[];
  expected: number[];
  contributions: number[];
  degreesOfFreedom: number;
}

export interface KSDetails {
  n: number;
  dPlus: number;
  dMinus: number;
  maxDeviation: number;
  sortedValues: number[];
}

export interface PokerHandCount {
  name: string;
  observed: number;
  expected: number;
  probability: number;
}

export interface PokerHandSample {
  handIndex: number;
  digits: number[];
  frequencyPattern: number[];
  categoryCode: string;
  categoryName: string;
}

export interface PokerMergedCategory {
  name: string;
  observed: number;
  expected: number;
  contribution: number;
}

export interface PokerDetails {
  totalHands: number;
  handCounts: PokerHandCount[];
  sampleHands: PokerHandSample[];
  mergedCategories: PokerMergedCategory[];
  chiSquareStatistic: number;
  chiSquareCritical: number;
  degreesOfFreedom: number;
}
