import type { DriveStep } from 'driver.js';

export type TourCallbacks = {
  openConfig: (tab: string) => void;
  closeConfig: () => void;
  getGeneratorType: () => 'lcg' | 'mcg' | 'middle-square';
};

export function getTourSteps(cb: TourCallbacks): DriveStep[] {
  return [
    // 0 — Bienvenida (overlay, sin highlight)
    {
      popover: {
        title: 'Bienvenido al Simulador de Colas Bancarias',
        description:
          'Esta herramienta te permite experimentar con <strong>Generadores Pseudoaleatorios (PRNG)</strong> y visualizar una <strong>simulación de colas</strong> en un banco en tiempo real. Este tour te guiará paso a paso.',
        side: 'over',
        align: 'center',
      },
    },

    // 1 — Selector de generador
    {
      element: '[data-tour="generator-select"]',
      popover: {
        title: 'Generador de Números Pseudoaleatorios',
        description:
          'Elige el algoritmo PRNG que alimentará la simulación. <strong>LCG</strong> (Lineal) usa X<sub>n+1</sub> = (a·X<sub>n</sub> + c) mod m. <strong>MCG</strong> (Multiplicativo) fija c = 0. <strong>Cuadrados Medios</strong> de Von Neumann toma el cuadrado de la semilla y extrae los dígitos centrales.',
        side: 'right',
        align: 'start',
      },
    },

    // 3 — Controles de reproducción
    {
      element: '[data-tour="playback-controls"]',
      popover: {
        title: 'Controles de Reproducción',
        description:
          'Navega por los eventos de la simulación paso a paso: <strong>Reset</strong> vuelve al inicio, <strong>◀</strong> retrocede, <strong>▶/⏸</strong> reproduce o pausa la animación automática, y <strong>▶</strong> avanza un evento.',
        side: 'right',
        align: 'start',
      },
    },

    // 4 — Slider de velocidad
    {
      element: '[data-tour="speed-slider"]',
      popover: {
        title: 'Control de Velocidad',
        description:
          'Ajusta la velocidad de la animación automática. Valores más bajos significan eventos más rápidos. Puedes observar cómo la cola se comporta a distintas velocidades.',
        side: 'right',
        align: 'start',
      },
    },

    // 5 — Botón Configurar
    {
      element: '[data-tour="config-button"]',
      popover: {
        title: 'Panel de Configuración',
        description:
          'Haz clic aquí para abrir la ventana de configuración avanzada. Dentro podrás ajustar los <strong>parámetros del generador</strong>, ejecutar <strong>pruebas estadísticas</strong>, configurar la <strong>simulación de colas</strong> y consultar la <strong>referencia teórica</strong>.',
        side: 'right',
        align: 'start',
      },
    },

    // 6 — Abre el diálogo y va al tab Generador
    {
      element: '[data-tour="tab-generator"]',
      onHighlightStarted: () => cb.openConfig('generator'),
      popover: {
        title: 'Pestaña: Generador',
        description:
          'Aquí configuras los <strong>parámetros del PRNG</strong> seleccionado (semilla, multiplicador <em>a</em>, incremento <em>c</em>, módulo <em>m</em>). Al generar, obtienes una tabla de resultados, una gráfica de la secuencia y los resultados de <strong>pruebas estadísticas</strong> (Chi-Cuadrado, Kolmogorov-Smirnov, Poker).',
        side: 'bottom',
        align: 'start',
      },
    },

    // 7 — Tab Simulación
    {
      element: '[data-tour="tab-simulation"]',
      onHighlightStarted: () => cb.openConfig('simulation'),
      popover: {
        title: 'Pestaña: Simulación',
        description:
          'Define los parámetros de la <strong>simulación de colas M/M/c</strong>: número de servidores (ventanillas), cantidad de clientes, tasa de llegada (λ) y tasa de servicio (μ). Puedes usar distribución <strong>exponencial</strong> o una <strong>tabla personalizada</strong> de probabilidades.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 8 — Tab Comparar
    {
      element: '[data-tour="tab-compare"]',
      onHighlightStarted: () => cb.openConfig('compare'),
      popover: {
        title: 'Pestaña: Comparar',
        description:
          'Compara los tres generadores (LCG, MCG, Cuadrados Medios) usando la <strong>misma semilla</strong>. Observa cómo cada algoritmo produce secuencias distintas y si pasan o no las pruebas de uniformidad.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 9 — Tab Ecuaciones
    {
      element: '[data-tour="tab-equations"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Pestaña: Ecuaciones',
        description:
          'Consulta la <strong>referencia teórica</strong> con las fórmulas de cada generador, las pruebas estadísticas y la teoría de colas M/M/c. Útil como apoyo mientras experimentas con los parámetros.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 10 — Tab Atajos
    {
      element: '[data-tour="tab-shortcuts"]',
      onHighlightStarted: () => cb.openConfig('shortcuts'),
      popover: {
        title: 'Pestaña: Atajos de Teclado',
        description:
          'Accesos rápidos para controlar la simulación sin usar el mouse. Incluyen <strong>Espacio</strong> (play/pausa), <strong>← →</strong> (paso atrás/adelante), <strong>R</strong> (reset) y <strong>1–5</strong> (cambiar pestaña).',
        side: 'bottom',
        align: 'start',
      },
    },

    // 11 — Cierre
    {
      onHighlightStarted: () => cb.closeConfig(),
      popover: {
        title: '¡Listo para explorar!',
        description:
          'Ahora conoces las principales funciones del simulador. <strong>Experimenta</strong> cambiando parámetros del generador, ejecuta pruebas estadísticas y observa cómo afectan la simulación en la escena 3D. ¡Buena suerte!',
        side: 'over',
        align: 'center',
      },
    },
  ];
}

export function getGeneratorTourSteps(cb: TourCallbacks): DriveStep[] {
  const generatorType = cb.getGeneratorType();

  const lcgSteps: DriveStep[] = [
    {
      element: '[data-tour="lcg-seed"]',
      popover: {
        title: '2) Semilla (X0)',
        description:
          'Es el valor inicial. Cambiar la semilla cambia toda la secuencia aunque mantengas los demás parámetros.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lcg-a"]',
      popover: {
        title: '3) Multiplicador (a)',
        description:
          'Controla cómo evoluciona la secuencia. Debe ser mayor a 0 y bien elegido para evitar ciclos cortos.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lcg-c"]',
      popover: {
        title: '4) Incremento (c)',
        description:
          'Término aditivo del LCG. Junto con m define si puedes alcanzar período máximo.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lcg-m"]',
      popover: {
        title: '5) Módulo (m)',
        description:
          'Define el rango de enteros y el período potencial del generador. Debe ser mayor a 0.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="lcg-count"]',
      popover: {
        title: '6) Cantidad (N)',
        description:
          'Número de valores que vas a generar para analizar la secuencia y correr pruebas.',
        side: 'right',
        align: 'start',
      },
    },
  ];

  const mcgSteps: DriveStep[] = [
    {
      element: '[data-tour="mcg-seed"]',
      popover: {
        title: '2) Semilla (X0)',
        description:
          'Valor inicial del MCG. Debe ser diferente de 0 para evitar secuencia trivial.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="mcg-a"]',
      popover: {
        title: '3) Multiplicador (a)',
        description:
          'Es el parámetro principal del MCG. Si está mal elegido, la calidad y período empeoran.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="mcg-m"]',
      popover: {
        title: '4) Módulo (m)',
        description:
          'Determina el rango y el período posible. Usar módulos primos grandes suele ayudar.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="mcg-count"]',
      popover: {
        title: '5) Cantidad (N)',
        description:
          'Cantidad de números pseudoaleatorios que deseas generar en esta corrida.',
        side: 'right',
        align: 'start',
      },
    },
  ];

  const msSteps: DriveStep[] = [
    {
      element: '[data-tour="ms-seed"]',
      popover: {
        title: '2) Semilla',
        description:
          'Número inicial que se elevará al cuadrado en cada iteración. Distintas semillas producen comportamientos muy distintos.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ms-d"]',
      popover: {
        title: '3) Dígitos (d)',
        description:
          'Cantidad de dígitos centrales que se extraen. Debe ser par; valores pequeños tienden a degradar más rápido.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="ms-iterations"]',
      popover: {
        title: '4) Iteraciones',
        description:
          'Cuántas veces se aplica el algoritmo. Útil para detectar ciclos cortos o degeneración.',
        side: 'right',
        align: 'start',
      },
    },
  ];

  const parameterSteps = generatorType === 'lcg' ? lcgSteps : generatorType === 'mcg' ? mcgSteps : msSteps;

  return [
    {
      popover: {
        title: 'Mini tour: Generador',
        description:
          'Este recorrido corto te muestra lo esencial para configurar un PRNG, generar una secuencia y evaluar su calidad con pruebas estadísticas.',
        side: 'over',
        align: 'center',
      },
    },
    {
      element: '[data-tour="tab-generator"]',
      onHighlightStarted: () => cb.openConfig('generator'),
      popover: {
        title: '1) Elige el algoritmo',
        description:
          'Comienza en la pestaña <strong>Generador</strong>. Aquí puedes alternar entre LCG, MCG y Cuadrados Medios para estudiar cómo cambia la secuencia.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generator-type-select"]',
      popover: {
        title: 'Tipo de generador activo',
        description:
          `Este mini tour ahora explica los campos del generador <strong>${generatorType === 'lcg' ? 'LCG' : generatorType === 'mcg' ? 'MCG' : 'Cuadrados Medios'}</strong>.`,
        side: 'right',
        align: 'start',
      },
    },
    ...parameterSteps,
    {
      element: '[data-tour="generator-generate"]',
      popover: {
        title: `${parameterSteps.length + 3}) Genera la secuencia`,
        description:
          'Con los parámetros listos, pulsa <strong>Generar</strong>. Verás la tabla de iteraciones y la gráfica de valores normalizados Rᵢ en [0,1).',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="generator-run-tests"]',
      popover: {
        title: `${parameterSteps.length + 4}) Evalúa calidad estadística`,
        description:
          'Después de generar, ejecuta <strong>Pruebas</strong> para validar uniformidad e independencia (Chi-Cuadrada, K-S y Póker).',
        side: 'top',
        align: 'start',
      },
    },
    {
      popover: {
        title: 'Listo',
        description:
          'Ya tienes el flujo básico: elegir método, configurar, generar y validar. Ahora prueba distintos parámetros y compara resultados.',
        side: 'over',
        align: 'center',
      },
    },
  ];
}

export function getEquationsTourSteps(cb: TourCallbacks): DriveStep[] {
  return [
    {
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Mini tour: Ecuaciones',
        description:
          'Vamos ecuacion por ecuacion para entender que representa cada simbolo y como se conecta con la simulacion. Son 6 estaciones rapidas.',
        side: 'over',
        align: 'center',
      },
    },
    {
      element: '[data-tour="tab-equations"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 1/6: mapa teorico',
        description:
          'En esta pestana tienes una referencia compacta. Avanza por estaciones para ver de forma guiada las formulas mas importantes.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="equations-tour-start"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Dinamica del recorrido',
        description:
          'Tip: piensa cada bloque como una mision corta. Identifica las variables clave y conectalas con lo que observas al generar y simular.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-generators"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 2/6: generadores PRNG',
        description:
          'Aqui nace la secuencia. LCG y MCG producen X(n+1) con modulo m; Cuadrados Medios toma digitos centrales. Mini reto: ubica cual formula usa incremento c.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-normalization"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 3/6: normalizacion',
        description:
          'R(i) = X/m convierte enteros a [0,1). Sin este paso no podrias aplicar facilmente pruebas de uniformidad ni distribuciones para la simulacion.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-chi-square"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 4/6: chi-cuadrada',
        description:
          'Compara observado O(i) vs esperado E(i). Si chi calculada no supera el valor critico, no hay evidencia fuerte para rechazar uniformidad.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-ks"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 5/6: Kolmogorov-Smirnov',
        description:
          'Mide la mayor distancia D entre la distribucion empirica y la teorica U(0,1). Mini reto: busca la formula de D+ y D-.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-poker"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Bonus: prueba de poker',
        description:
          'Clasifica patrones de 5 digitos (par, tercia, full, etc.) y luego aplica chi-cuadrada sobre frecuencias. Es una lectura divertida de patrones.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="eq-queue-mmc"]',
      onHighlightStarted: () => cb.openConfig('equations'),
      popover: {
        title: 'Estacion 6/6: colas M/M/c',
        description:
          'Aqui conectas teoria con comportamiento del banco: lambda (llegadas), mu (servicio), c (servidores) y rho. Regla de oro: estabilidad si rho < 1.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tour="tab-simulation"]',
      onHighlightStarted: () => cb.openConfig('simulation'),
      popover: {
        title: 'Siguiente paso sugerido',
        description:
          'Pasa a Simulacion para probar la teoria en accion. Cambia lambda y mu, ejecuta y observa si el sistema se mantiene estable.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      onHighlightStarted: () => cb.closeConfig(),
      popover: {
        title: 'Tour completado',
        description:
          'Excelente. Ya tienes el mapa de ecuaciones. Ahora puedes interpretar resultados con mas criterio y no solo mirar si una prueba pasa o falla.',
        side: 'over',
        align: 'center',
      },
    },
  ];
}
