import type { DriveStep } from 'driver.js';

export type TourCallbacks = {
  openConfig: (tab: string) => void;
  closeConfig: () => void;
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

    // 1 — Escena 3D
    {
      element: '[data-tour="scene"]',
      popover: {
        title: 'Escena 3D del Banco',
        description:
          'Aquí se visualiza la simulación: los <strong>clientes</strong> (figuras de colores) llegan, hacen fila, son atendidos y se retiran. Usa el <strong>mouse</strong> para rotar, hacer zoom y mover la cámara. Los colores indican el estado: <span style="color:#f59e0b">ámbar</span> = esperando, <span style="color:#3b82f6">azul</span> = siendo atendido, <span style="color:#22c55e">verde</span> = saliendo.',
        side: 'over',
        align: 'center',
      },
    },

    // 2 — Selector de generador
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
