# Simulador PRNG + Colas Bancarias 3D

Aplicación web educativa para estudiar la calidad de generadores pseudoaleatorios (PRNG) y su impacto en una simulación de colas bancarias tipo M/M/c, con visualización 3D en tiempo real.

Este frontend permite:

- Generar secuencias con **LCG**, **MCG** y **Cuadrados Medios**.
- Ejecutar pruebas estadísticas: **Chi-cuadrada**, **Kolmogorov-Smirnov** y **Póker**.
- Simular un sistema de colas con eventos discretos (llegadas/salidas).
- Reproducir la simulación paso a paso con controles y atajos de teclado.
- Consultar soporte teórico dentro de la UI (ecuaciones, tooltips, ayuda educativa y tours).

---

## 1. Objetivo del proyecto

El proyecto está diseñado para cursos de simulación/modelado y probabilidad aplicada. La idea central es conectar tres piezas:

1. **Generación de números pseudoaleatorios**.
2. **Validación estadística** de la secuencia.
3. **Uso de la secuencia** en un modelo de cola para observar efectos en métricas operativas.

De esta forma se evita tratar al PRNG como una “caja negra”: se estudia su configuración, su comportamiento matemático y su consecuencia práctica en la simulación.

---

## 2. Stack tecnológico

- **Frontend:** React 19 + TypeScript + Vite 8.
- **Visualización 3D:** Three.js con `@react-three/fiber` y `@react-three/drei`.
- **Estado global:** Zustand (con persistencia parcial para preferencias UI).
- **UI:** componentes tipo shadcn/radix + Tailwind.
- **Gráficas:** Recharts.
- **Notificaciones:** Sonner (toasts).
- **Fórmulas matemáticas:** KaTeX.
- **Tour guiado:** Driver.js.
- **Testing:** Vitest + jsdom.

---

## 3. Requisitos

- Node.js 20+ (recomendado para Vite 8).
- npm 10+.

---

## 4. Instalación y ejecución

Desde la carpeta `frontend-threejs`:

```bash
npm install
npm run dev
```

La app quedará disponible en la URL local que imprima Vite (normalmente `http://localhost:5173`).

### Scripts disponibles

```bash
npm run dev      # entorno de desarrollo
npm run build    # compilación TypeScript + build de Vite
npm run preview  # previsualizar build de producción
npm run lint     # lint del proyecto
npm run test     # pruebas unitarias (Vitest)
```

---

## 5. Flujo funcional de la aplicación

### 5.1 Flujo recomendado de uso

1. Seleccionar tipo de generador (LCG/MCG/Cuadrados Medios).
2. Configurar parámetros y generar secuencia.
3. Ejecutar pruebas estadísticas.
4. Configurar simulación de colas.
5. Ejecutar simulación y analizar eventos, métricas y escena 3D.

### 5.2 Tabs principales del diálogo de configuración

- **Generador:** parámetros, tabla de iteraciones, gráfica de secuencia, detección de período/repetición y pruebas.
- **Comparar:** corre los 3 generadores y compara resultados de pruebas + valores Ri.
- **Simulación:** define parámetros M/M/c y ejecuta motor de eventos discretos.
- **Ecuaciones:** referencia teórica de fórmulas y conceptos.
- **Atajos:** listado completo de shortcuts de teclado.

---

## 6. Cómo funciona internamente

### 6.1 Estado global y orquestación

El centro de control está en `src/store/store.ts`.

Allí se mantienen:

- Configuraciones de PRNG (`lcgConfig`, `mcgConfig`, `msConfig`).
- Resultados de generación y pruebas estadísticas.
- Configuración y resultado de simulación.
- Estado de reproducción (evento actual, play/pause, velocidad).
- Estado UI (tab activo, diálogo abierto/cerrado, modo expandido).

Acciones clave:

- `generate()`: ejecuta el PRNG seleccionado y guarda resultado.
- `runTests()`: lanza Chi-cuadrada, K-S y Póker sobre la secuencia generada.
- `runSim()`: ejecuta el motor de simulación con la secuencia normalizada.

Nota: si faltan números para simular (`2 * customerCount`), `runSim()` autogenera una secuencia con el generador actual.

### 6.2 Generadores implementados

Ubicación: `src/lib/generators/`

- **LCG (`lcg.ts`)**
  - Fórmula: `X_{n+1} = (a*X_n + c) mod m`
  - Valida límites de `m` y `count`.
- **MCG (`mcg.ts`)**
  - Fórmula: `X_{n+1} = (a*X_n) mod m`
  - Restringe semilla distinta de cero.
- **Cuadrados Medios (`middle-square.ts`)**
  - Cuadra la semilla, rellena, extrae dígitos centrales.
  - Detecta degeneración por convergencia a 0 o ciclo repetido.

Todos retornan:

- Secuencia entera.
- Pasos intermedios (detalle por iteración).
- Secuencia normalizada `Ri` en `[0,1)`.

### 6.3 Pruebas estadísticas

Ubicación: `src/lib/tests/`

- **Chi-cuadrada (`chi-square.ts`)**
  - Divide `[0,1)` en `k` intervalos y compara observados vs esperados.
- **Kolmogorov-Smirnov (`kolmogorov-smirnov.ts`)**
  - Calcula máxima desviación entre CDF empírica y teórica uniforme.
- **Póker (`poker.ts`)**
  - Forma manos de 5 dígitos (a partir de decimales) y evalúa patrón de frecuencias.

La UI muestra para cada prueba:

- Estadístico calculado.
- Valor crítico.
- Decisión (aprobada/rechazada).
- Gráficas y vista ampliada con explicación educativa.

### 6.4 Motor de simulación de colas

Ubicación: `src/lib/simulation/engine.ts`

Modelo:

- Sistema **M/M/c** (llegadas y servicios con modo exponencial o tabla discreta).
- Manejo de **eventos pendientes** (`ARRIVAL` y `DEPARTURE`) ordenados por tiempo.
- Construcción de `snapshots` para reproducción paso a paso en 3D.

Distribuciones:

- `exponentialInverseTransform()` usa transformada inversa: `X = -ln(1-u)/rate`.
- `tableLookup()` mapea `u` a tiempos discretos por rango.

Salida de la simulación:

- Historial de eventos.
- Tabla por cliente (tiempos de llegada, espera, servicio, salida, servidor).
- Métricas agregadas (`avgWaitTime`, `avgQueueLength`, `serverUtilization`, etc.).
- Snapshots para animación y navegación temporal.

### 6.5 Visualización 3D

Ubicación principal: `src/components/scene/BankScene.tsx`.

La escena:

- Renderiza piso, cabinas de operador y personajes (clientes).
- Se sincroniza con el snapshot actual de simulación.
- Muestra estados visuales: cliente llegando, esperando, siendo atendido o saliendo.
- Permite control de cámara con `OrbitControls`.

---

## 7. Atajos de teclado

Definidos en `src/lib/shortcuts.ts` y conectados en `src/hooks/useKeyboardShortcuts.ts`.

Atajos más usados:

- `Space`: play/pausa.
- `ArrowRight`: avanzar un evento.
- `ArrowLeft`: retroceder un evento.
- `R`: reiniciar a evento 0.
- `C`: abrir/cerrar configuración.
- `Esc`: cerrar configuración.
- `Ctrl + 1..5`: cambiar tab.
- `Ctrl + G`: generar secuencia.
- `Ctrl + T`: ejecutar pruebas.
- `Ctrl + Enter`: ejecutar simulación.

---

## 8. Tour guiado

El proyecto incluye recorridos educativos con Driver.js.

Ubicación:

- `src/tour/tour-steps.ts`
- `src/tour/useGuidedTour.ts`

Hay tours generales y mini tours por secciones (por ejemplo, Generador y Ecuaciones), con enfoque explicativo del flujo matemático y operativo.

---

## 9. Estructura del proyecto (resumen)

```text
frontend-threejs/
  src/
    components/
      config/        # tabs, formularios, gráficos, ayuda educativa
      controls/      # panel principal de reproducción y control
      scene/         # escena 3D del banco y personajes
      ui/            # componentes base de interfaz
    hooks/           # hooks de shortcuts y preferencias del diálogo
    lib/
      generators/    # LCG, MCG, Cuadrados Medios, validaciones
      tests/         # pruebas estadísticas
      simulation/    # motor de eventos discretos y distribuciones
      shortcuts.ts   # definición y resolución de atajos
    store/
      store.ts       # estado global y acciones de la app
    tour/            # tours guiados con Driver.js
```

---

## 10. Decisiones de diseño relevantes

- **Persistencia parcial de estado UI**: sólo preferencias visuales/navegación, no resultados pesados.
- **Autogeneración de secuencia para simulación**: evita bloqueos cuando no hay suficientes `Ri`.
- **Límites de tamaño** (por ejemplo, hasta 10,000 valores): protege rendimiento del navegador.
- **Vistas expandidas y explicaciones educativas**: prioriza uso académico, no solo cálculo.

---

## 11. Solución de problemas comunes

- **"La secuencia no puede estar vacía"**
  - Primero genera valores en la pestaña Generador.

- **Error de parámetros en LCG/MCG**
  - Verifica `m > 0`, semilla válida y cantidad dentro de rango.

- **Cuadrados Medios se degenera rápido**
  - Cambia semilla y/o `d`; es un comportamiento conocido del método.

- **Faltan aleatorios para simular**
  - La app puede autogenerar, pero conviene definir una cantidad mayor manualmente para análisis reproducible.

- **Rendimiento bajo con grandes volúmenes**
  - Reduce `N`, clientes o nivel de detalle visual en la exploración.

---

## 12. Calidad y validación

Recomendación rápida antes de subir cambios:

```bash
npm run lint
npm run test
npm run build
```

---

## 13. Próximos pasos sugeridos

Como evolución natural del proyecto:

- Agregar exportación de resultados (CSV/JSON).
- Parametrizar y editar tablas discretas desde la UI.
- Incorporar más pruebas de aleatoriedad.
- Integrar escenarios comparativos guardables para clase/laboratorio.

---

## 14. Créditos

Proyecto académico orientado a simulación y análisis de PRNG. Si lo usas en clase o laboratorio, se recomienda documentar parámetros y semillas para poder reproducir experimentos.
