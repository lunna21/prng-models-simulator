import type { GeneratorType } from '@/lib/generators/types';

interface HelpSection {
  title: string;
  content: string;
  formulaTex?: string;
}

interface GeneratorHelp {
  title: string;
  description: string;
  videoUrl: string;
  sections: HelpSection[];
  tryItNow: {
    title: string;
    steps: string[];
    expected: string;
  };
  whenToUse: string[];
  interpretationTips: string[];
}

export const HELP_CONTENT: Record<GeneratorType, GeneratorHelp> = {
  lcg: {
    title: 'Congruencial Lineal (LCG)',
    description:
      'Genera números pseudoaleatorios mediante una relación lineal recursiva. Es el método más utilizado en la práctica por su simplicidad y eficiencia.',
    videoUrl: 'https://www.youtube.com/watch?v=PM_c_g-N8vs',
    sections: [
      {
        title: '¿Cómo funciona?',
        content:
          'A partir de una semilla X₀, cada nuevo valor se calcula como Xₙ₊₁ = (a·Xₙ + c) mod m. Luego se normaliza dividiendo entre m para obtener Rᵢ en [0, 1). El ciclo se repite hasta generar la cantidad deseada de valores.',
        formulaTex: 'X_{n+1} = (aX_n + c)\\bmod m,\\qquad R_i = \\frac{X_{n+1}}{m}',
      },
      {
        title: 'Condiciones de período máximo (Hull-Dobell)',
        content:
          'Para garantizar período m (el máximo posible), se deben cumplir 3 condiciones simultáneamente: (1) c y m son coprimos, (2) a-1 es divisible por todos los factores primos de m, (3) si m es divisible por 4, entonces a-1 también lo es.',
        formulaTex: '\\gcd(c,m)=1,\\quad (a-1)\\equiv 0\\pmod p\ \\forall\ p\\mid m,\\quad m\\equiv 0\\pmod 4\\Rightarrow (a-1)\\equiv 0\\pmod 4',
      },
      {
        title: 'Parámetros clásicos',
        content:
          'a=1664525, c=1013904223, m=2³² (Numerical Recipes). Para sistemas de 31 bits: a=1103515245, c=12345, m=2³¹ (glibc/ANSI C). Estos garantizan período completo.',
        formulaTex: '(a,c,m)=(1664525,1013904223,2^{32})\ \\text{o}\ (1103515245,12345,2^{31})',
      },
    ],
    tryItNow: {
      title: 'Prueba rápida recomendada',
      steps: [
        'Usa semilla=1, a=1664525, c=1013904223, m=4294967296 y N=100.',
        'Haz clic en Generar y observa la gráfica de la secuencia.',
        'Luego ejecuta las pruebas estadísticas.',
      ],
      expected: 'Debes ver una secuencia sin patrón obvio y resultados generalmente aceptables para uso educativo.',
    },
    whenToUse: [
      'Simulación general de Monte Carlo',
      'Cuando se necesita un período largo y predecible',
      'Aplicaciones donde la velocidad es importante',
      'Generación de números para pruebas estadísticas',
    ],
    interpretationTips: [
      'La secuencia debe verse uniformemente distribuida en [0, 1)',
      'Si los valores se repiten antes de generar m números, el período es menor al máximo',
      'La prueba Chi-Cuadrado verifica la uniformidad de la distribución',
      'La prueba K-S compara la distribución empírica con la teórica U(0,1)',
    ],
  },
  mcg: {
    title: 'Congruencial Multiplicativo (MCG)',
    description:
      'Variante del LCG donde c = 0. Más rápido pero con restricciones más estrictas sobre los parámetros para lograr buen período.',
    videoUrl: 'https://www.youtube.com/watch?v=Mdo-B2NKMD0',
    sections: [
      {
        title: '¿Cómo funciona?',
        content:
          'Similar al LCG pero sin incremento: Xₙ₊₁ = (a·Xₙ) mod m. La semilla X₀ debe ser distinta de cero. Se normaliza igual: Rᵢ = Xₙ₊₁ / m.',
        formulaTex: 'X_{n+1} = (aX_n)\\bmod m,\\qquad R_i = \\frac{X_{n+1}}{m}',
      },
      {
        title: 'Condiciones de período máximo',
        content:
          'Para m = 2ᵉ: período m/4 si a ≡ 3 o 5 (mod 8) y la semilla es impar. Para m primo: período m-1 si a es raíz primitiva de m. Ejemplo clásico: m=2³¹-1 (primo de Mersenne), a=48271.',
        formulaTex: 'm=2^e\\Rightarrow a\\equiv 3\ \\text{o}\ 5\ (\\bmod\ 8),\ X_0\ \\text{impar};\\quad m\ \\text{primo}\\Rightarrow a\ \\text{raiz primitiva},\ \\text{periodo}=m-1',
      },
      {
        title: 'Limitaciones',
        content:
          'El valor 0 nunca aparece en la secuencia (puede ser ventaja o desventaja según la aplicación). Requiere más cuidado en la selección de parámetros que el LCG.',
      },
    ],
    tryItNow: {
      title: 'Prueba rápida recomendada',
      steps: [
        'Usa semilla=1, a=48271, m=2147483647 y N=100.',
        'Genera la secuencia y revisa si hay repetición temprana.',
        'Compara sus pruebas con el LCG en la pestaña Comparar.',
      ],
      expected: 'Deberías obtener un comportamiento estable; la calidad dependerá de que m y a estén bien elegidos.',
    },
    whenToUse: [
      'Cuando se necesita máxima velocidad (una multiplicación menos por iteración)',
      'Generación de enteros donde 0 no es un valor válido',
      'Cuando se trabaja con módulos primos grandes (mejores propiedades estadísticas)',
      'Sistemas embebidos con recursos limitados',
    ],
    interpretationTips: [
      'Verifique que la semilla no sea cero (causaría secuencia trivial de ceros)',
      'La secuencia nunca contiene el valor 0',
      'Para m=2^e, observe que el período es m/4, no m',
      'Compare con el LCG: el MCG puede tener mejor o peor calidad según los parámetros',
    ],
  },
  'middle-square': {
    title: 'Cuadrados Medios (von Neumann)',
    description:
      'Método histórico propuesto por John von Neumann (1946). Fue el primer generador de números pseudoaleatorios. Tiene graves limitaciones prácticas pero valor educativo.',
    videoUrl: 'https://www.youtube.com/watch?v=uag9J1mTvec',
    sections: [
      {
        title: '¿Cómo funciona?',
        content:
          'Se toma un número de d dígitos, se eleva al cuadrado, se rellena con ceros a la izquierda hasta tener 2d dígitos, y se extraen los d dígitos centrales como el siguiente valor.',
        formulaTex: 'X_{n+1}=\\operatorname{mid}_d(X_n^2),\\qquad R_i=\\frac{X_{n+1}}{10^d}',
      },
      {
        title: 'Problemas conocidos',
        content:
          'Tendencia a converger a cero (degeneración). Períodos cortos e impredecibles. Semillas "trampa" que producen secuencias triviales. No recomendado para uso práctico actual.',
      },
      {
        title: 'Valor educativo',
        content:
          'Ilustra la importancia de la selección de parámetros en generadores. Muestra cómo un método intuitivo puede fallar. Sirve como base para entender por qué se desarrollaron métodos más robustos como LCG/MCG.',
      },
    ],
    tryItNow: {
      title: 'Prueba rápida recomendada',
      steps: [
        'Usa semilla=1234, d=4 e iteraciones=40.',
        'Genera y observa la tabla con dígitos centrales.',
        'Busca cuándo aparece repetición o degeneración.',
      ],
      expected: 'Es común detectar ciclos cortos o convergencia rápida: ese es justamente su valor educativo.',
    },
    whenToUse: [
      'Solo con fines educativos e históricos',
      'Para entender la evolución de los generadores pseudoaleatorios',
      'Demostración de por qué se necesitan métodos más sofisticados',
      'NO recomendado para simulaciones reales',
    ],
    interpretationTips: [
      'Si la secuencia converge a 0, es un caso de degeneración (problema conocido)',
      'Si los valores repiten rápidamente, el período es corto',
      'Observe el patrón de dígitos: buenos generadores muestran variación constante',
      'Compare la distribución con un LCG para ver la diferencia en calidad',
    ],
  },
};
