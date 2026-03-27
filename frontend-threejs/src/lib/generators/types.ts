export interface StepDetail {
  iteration: number;
  xPrev: number;
  formula: string;
  xNext: number;
  normalized: number;
}

export interface MiddleSquareStepDetail extends StepDetail {
  squared: number;
  padded: string;
  extracted: string;
  leftPart: string;
  rightPart: string;
}

export interface DegenerationInfo {
  iteration: number;
  reason: 'zero' | 'cycle';
  value: number;
}

export interface GeneratorResult {
  sequence: number[];
  steps: StepDetail[];
  normalized: number[];
  digits?: number;
  degenerated?: DegenerationInfo | null;
}

export type GeneratorType = 'lcg' | 'mcg' | 'middle-square';

export interface LCGParams {
  seed: number;
  a: number;
  c: number;
  m: number;
  count: number;
}

export interface MCGParams {
  seed: number;
  a: number;
  m: number;
  count: number;
}

export interface MiddleSquareParams {
  seed: number;
  iterations: number;
  d: number;
}

export type GeneratorParams = LCGParams | MCGParams | MiddleSquareParams;
