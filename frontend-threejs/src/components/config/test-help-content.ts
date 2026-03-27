export interface TestHelpSection {
  title: string;
  content: string;
}

export interface TestHelpContent {
  title: string;
  whatItEvaluates: TestHelpSection;
  howItWorks: TestHelpSection[];
  keyFormula: {
    label: string;
    tex: string;
    description: string;
  };
  interpretationTips: string[];
}

const CHI_SQUARE_CONTENT: TestHelpContent = {
  title: 'Prueba Chi-Cuadrada',
  whatItEvaluates: {
    title: '¿Qué evalúa?',
    content:
      'La prueba Chi-Cuadrada (χ²) evalúa si los números pseudoaleatorios se distribuyen uniformemente en el intervalo [0, 1). Divide el intervalo en k subintervalos (bins) y compara las frecuencias observadas con las esperadas bajo una distribución uniforme perfecta.',
  },
  howItWorks: [
    {
      title: '1. División en intervalos',
      content:
        'Se divide el rango [0, 1) en k subintervalos iguales (típicamente k = 10). Cada número generado pertenece a exactamente un intervalo.',
    },
    {
      title: '2. Conteo de frecuencias',
      content:
        'Se cuenta cuántos valores caen en cada intervalo (frecuencia observada Oᵢ). La frecuencia esperada Eᵢ para distribución uniforme es n/k, donde n es el total de números.',
    },
    {
      title: '3. Cálculo del estadístico',
      content:
        'Se calcula χ² = Σ(Oᵢ - Eᵢ)² / Eᵢ para todos los intervalos. Un valor pequeño indica buena uniformidad.',
    },
    {
      title: '4. Comparación con valor crítico',
      content:
        'Se compara el estadístico con el valor crítico de la tabla χ² para gl = k-1 grados de libertad y α = 0.05. Si χ² ≤ χ²crit, la secuencia pasa la prueba.',
    },
  ],
  keyFormula: {
    label: 'Estadístico Chi-Cuadrada',
    tex: '\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}',
    description: 'Oᵢ = frecuencia observada, Eᵢ = frecuencia esperada = n/k, k = número de intervalos, gl = k-1.',
  },
  interpretationTips: [
    'Un valor χ² cercano a gl indica uniformidad perfecta',
    'χ² muy bajo puede indicar patrones repetitivos',
    'χ² mayor al crítico → secuencia no uniforme (rechazada)',
    'Es sensible al número de intervalos elegido',
  ],
};

const KS_CONTENT: TestHelpContent = {
  title: 'Prueba Kolmogorov-Smirnov',
  whatItEvaluates: {
    title: '¿Qué evalúa?',
    content:
      'La prueba K-S evalúa si la distribución empírica de los números se ajusta a la distribución teórica uniforme continua U(0,1). Compara la función de distribución acumulativa (CDF) observada con la teórica.',
  },
  howItWorks: [
    {
      title: '1. Ordenamiento',
      content:
        'Se ordenan todos los valores de menor a mayor: R₍₁₎ ≤ R₍₂₎ ≤ ... ≤ R₍ₙ₎. Este proceso se llama ordenamiento estadístico.',
    },
    {
      title: '2. Cálculo de D⁺',
      content:
        'D⁺ = max(i/n - R₍ᵢ₎) para i = 1,...,n. Mide la desviación máxima por encima de la línea teórica.',
    },
    {
      title: '3. Cálculo de D⁻',
      content:
        'D⁻ = max(R₍ᵢ₎ - (i-1)/n) para i = 1,...,n. Mide la desviación máxima por debajo de la línea teórica.',
    },
    {
      title: '4. Cálculo de D',
      content:
        'D = max(D⁺, D⁻). El estadístico D es la máxima desviación entre la CDF empírica y la teórica.',
    },
    {
      title: '5. Comparación',
      content:
        'Para n ≥ 35, el valor crítico es ≈ 1.36/√n. Para n menor, se usa tabla de valores críticos. Si D ≤ Dcrit, la secuencia pasa.',
    },
  ],
  keyFormula: {
    label: 'Estadístico K-S',
    tex: 'D = \\max(D^+, D^-) = \\max_{1 \\leq i \\leq n} \\left( \\frac{i}{n} - R_{(i)}, \\; R_{(i)} - \\frac{i-1}{n} \\right)',
    description: 'R₍ᵢ₎ = valores ordenados, n = tamaño de muestra, i = posición ordinal.',
  },
  interpretationTips: [
    'D = 0 indica ajuste perfecto a U(0,1)',
    'Es más sensible cerca de los extremos de la distribución',
    'No requiere especificar el número de intervalos',
    'Para muestras grandes (n≥35) usa aproximación asintótica',
  ],
};

const POKER_CONTENT: TestHelpContent = {
  title: 'Prueba de Póker',
  whatItEvaluates: {
    title: '¿Qué evalúa?',
    content:
      'La prueba de Póker evalúa la independencia entre los dígitos de los números pseudoaleatorios. Agrupa los números en "manos" de 5 dígitos y clasifica cada mano según el patrón de repetición de dígitos (todos diferentes, un par, dos pares, tercia, full house, póker, quintilla).',
  },
  howItWorks: [
    {
      title: '1. Formación de manos',
      content:
        'Los números normalizados se convierten a 5 dígitos decimales (ej: 0.12345 → 1,2,3,4,5). Se agrupan en manos de 5 dígitos consecutivos.',
    },
    {
      title: '2. Clasificación de patrones',
      content:
        'Cada mano se clasifica en 7 categorías: Todos diferentes (TD), Un par (1P), Dos pares (2P), Tercia (TP), Full House (FH), Póker (PK), Quintilla (QN).',
    },
    {
      title: '3. Conteo de frecuencias',
      content:
        'Se cuenta cuántas manos caen en cada categoría (observado). Las probabilidades teóricas bajo independencia son: TD=0.3024, 1P=0.504, 2P=0.108, TP=0.072, FH=0.009, PK=0.0045, QN=0.0001.',
    },
    {
      title: '4. Prueba Chi-Cuadrada',
      content:
        'Se aplica χ² sobre las frecuencias de categorías. Se fusionan categorías con frecuencia esperada < 5 para validez estadística.',
    },
    {
      title: '5. Interpretación',
      content:
        'Si χ² ≤ χ²crit, los dígitos son independientes (la secuencia pasa). Frecuencias anormales en ciertas categorías indican dependencia.',
    },
  ],
  keyFormula: {
    label: 'Probabilidades Poker',
    tex: 'TD=0.3024, \\; 1P=0.504, \\; 2P=0.108, \\; TP=0.072, \\; FH=0.009, \\; PK=0.0045, \\; QN=0.0001',
    description: 'TD=Todos diferentes, 1P=Un par, 2P=Dos pares, TP=Tercia, FH=Full House, PK=Póker, QN=Quintilla.',
  },
  interpretationTips: [
    'Detecta dependencia entre dígitos adyacentes',
    'Categorías con baja probabilidad deben combinarse para χ² válido',
    'Un resultado esperado bajo puede indicar sobre-representación de repeticiones',
    'Requiere al menos 5 números (1 mano de 5 dígitos)',
  ],
};

export const TEST_HELP_CONTENT: Record<string, TestHelpContent> = {
  chiSquare: CHI_SQUARE_CONTENT,
  kolmogorovSmirnov: KS_CONTENT,
  poker: POKER_CONTENT,
};

export function getTestHelpContent(testType: 'chiSquare' | 'kolmogorovSmirnov' | 'poker'): TestHelpContent {
  switch (testType) {
    case 'chiSquare':
      return TEST_HELP_CONTENT.chiSquare;
    case 'kolmogorovSmirnov':
      return TEST_HELP_CONTENT.kolmogorovSmirnov;
    case 'poker':
      return TEST_HELP_CONTENT.poker;
    default:
      return TEST_HELP_CONTENT.chiSquare;
  }
}
