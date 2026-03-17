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
}

export interface GeneratorResult {
  sequence: number[];
  steps: StepDetail[];
  normalized: number[];
  digits?: number;
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
}

export type GeneratorParams = LCGParams | MCGParams | MiddleSquareParams;
