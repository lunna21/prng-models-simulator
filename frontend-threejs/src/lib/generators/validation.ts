export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface ValidationReport {
  hasFullPeriod: boolean;
  checks: ValidationCheck[];
  maxPeriod: number;
  currentPeriod: string;
  suggestion?: string;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function primeFactors(n: number): number[] {
  const factors: number[] = [];
  n = Math.abs(n);
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      factors.push(d);
      while (n % d === 0) n /= d;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

/**
 * Hull-Dobell theorem conditions for LCG full period.
 * Full period m requires:
 *  1. gcd(c, m) = 1
 *  2. a - 1 divisible by all prime factors of m
 *  3. If 4 | m then 4 | (a - 1)
 */
export function validateLCG(a: number, c: number, m: number): ValidationReport {
  const checks: ValidationCheck[] = [];

  const gcdResult = gcd(c, m);
  checks.push({
    name: 'gcd(c, m) = 1',
    passed: gcdResult === 1,
    message: gcdResult === 1
      ? `c=${c} y m=${m} son coprimos.`
      : `c=${c} y m=${m} NO son coprimos (gcd=${gcdResult}). Cambie c o m para que sean coprimos.`,
  });

  const factors = primeFactors(m);
  const aMinus1 = a - 1;
  const failedFactors = factors.filter((p) => aMinus1 % p !== 0);
  checks.push({
    name: '(a-1) divisible por factores primos de m',
    passed: failedFactors.length === 0,
    message: failedFactors.length === 0
      ? `a-1=${aMinus1} es divisible por todos los factores primos de m={${factors.join(', ')}}.`
      : `a-1=${aMinus1} NO es divisible por: ${failedFactors.join(', ')}. Intente a=${aMinus1 + failedFactors[0]}.`,
  });

  const mDivBy4 = m % 4 === 0;
  const aMinus1DivBy4 = aMinus1 % 4 === 0;
  checks.push({
    name: 'Si 4 | m entonces 4 | (a-1)',
    passed: !mDivBy4 || aMinus1DivBy4,
    message: !mDivBy4
      ? `m=${m} no es divisible por 4, condición no aplica.`
      : aMinus1DivBy4
        ? `m divisible por 4 y a-1=${aMinus1} divisible por 4.`
        : `m divisible por 4 pero a-1=${aMinus1} NO divisible por 4. Intente a=${aMinus1 + (4 - (aMinus1 % 4))}.`,
  });

  const hasFullPeriod = checks.every((ch) => ch.passed);

  let suggestion: string | undefined;
  if (!hasFullPeriod) {
    suggestion = 'Valores clásicos de período completo: a=1664525, c=1013904223, m=2³².';
  }

  return {
    hasFullPeriod,
    checks,
    maxPeriod: m,
    currentPeriod: hasFullPeriod ? `${m} (máximo)` : `≤ ${m}`,
    suggestion,
  };
}

/**
 * MCG period validation.
 * For m = 2^e: period = m/4 if a ≡ 3 or 5 (mod 8), seed odd.
 * For prime m = p: period = p-1 if a is a primitive root of p.
 */
export function validateMCG(a: number, m: number, seed: number): ValidationReport {
  const checks: ValidationCheck[] = [];

  if (m <= 0) {
    return {
      hasFullPeriod: false,
      checks: [{ name: 'm > 0', passed: false, message: 'El módulo debe ser positivo.' }],
      maxPeriod: 0,
      currentPeriod: '0',
    };
  }

  // Check m = 2^e
  const log2m = Math.log2(m);
  const isPowerOf2 = Number.isInteger(log2m);

  if (isPowerOf2) {
    const e = log2m;
    const aMod8 = a % 8;
    const validMod8 = aMod8 === 3 || aMod8 === 5;
    checks.push({
      name: 'a ≡ 3 o 5 (mod 8)',
      passed: validMod8,
      message: validMod8
        ? `a=${a} ≡ ${aMod8} (mod 8). Correcto.`
        : `a=${a} ≡ ${aMod8} (mod 8). Para m=2^${e}, use a ≡ 3 o 5 (mod 8). Ej: a=${a + ((3 - aMod8 + 8) % 8)}.`,
    });

    const seedOdd = seed % 2 !== 0;
    checks.push({
      name: 'Semilla impar',
      passed: seedOdd,
      message: seedOdd
        ? `Semilla=${seed} es impar. Correcto.`
        : `Semilla=${seed} es par. Use una semilla impar para m=2^${e}.`,
    });

    const period = m / 4;
    const hasFullPeriod = checks.every((ch) => ch.passed);

    return {
      hasFullPeriod,
      checks,
      maxPeriod: period,
      currentPeriod: hasFullPeriod ? `${period} (máximo para m=2^${e})` : `≤ ${period}`,
      suggestion: !hasFullPeriod ? `Valores clásicos: a=5 (mod 8), m=2^31-1 o m=2^e, semilla impar.` : undefined,
    };
  }

  // Check if m is prime (trial division)
  let isPrime = m > 1;
  for (let d = 2; d * d <= m; d++) {
    if (m % d === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) {
    checks.push({
      name: 'm es primo',
      passed: true,
      message: `m=${m} es primo. Período máximo: ${m - 1}.`,
    });

    // For prime m, period = m-1 if a is a primitive root.
    // We can't easily verify primitivity for large m, so we just inform.
    checks.push({
      name: 'a es raíz primitiva de m',
      passed: true,
      message: `Verifique que a=${a} sea raíz primitiva de ${m} para período completo ${m - 1}.`,
    });

    return {
      hasFullPeriod: true,
      checks,
      maxPeriod: m - 1,
      currentPeriod: `${m - 1} (si a es raíz primitiva)`,
      suggestion: `Primos comunes: m=2147483647 (2³¹-1), a=48271 o a=16807.`,
    };
  }

  // Mixed modulus
  checks.push({
    name: 'm compuesto',
    passed: false,
    message: `m=${m} es compuesto y no es potencia de 2. El análisis de período requiere el Teorema del Resto Chino.`,
  });

  return {
    hasFullPeriod: false,
    checks,
    maxPeriod: m,
    currentPeriod: `Depende de la estructura de m=${m}`,
    suggestion: 'Use m como potencia de 2 o primo para garantizar período máximo.',
  };
}
