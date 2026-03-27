# Backlog de mejoras (pendiente)

## Identidad visual y navegación
- [x] Implementar una sección de **shortcuts (atajos de teclado)** para acelerar el uso de la herramienta.
- [x] Crear un **tour guiado** con enfoque educativo usando **Driver.js**, asegurando que el diseño (tipografías, colores, spaciados, overlays y botones) quede totalmente alineado con el estilo visual actual de la app y sea responsive.

## Generador: mejoras funcionales y educativas
- [x] Mejorar la pestaña de **Ecuaciones**:
  - [x] añadir animaciones para hacer la interacción más dinámica
  - [x] usar colores para resaltar componentes clave de las fórmulas
  - [x] aplicar buen formato matemático con una librería (por ejemplo, **KaTeX** o **MathJax**)
- [x] En el tab **Generador**, implementar validación/asistencia para elegir parámetros que garanticen **período máximo N** en:
  - [x] Modelo congruencial lineal
  - [x] Modelo congruencial multiplicativo
  Referencia: condiciones de Banks, Carson, Nelson y Nicol.
- [x] Agregar un botón de **Ayuda educativa** en el tab Generador para explicar:
  - [x] cómo funciona cada tipo de generador
  - [x] en qué casos aplicarlo
  - [x] interpretación de resultados

## Inputs, validaciones y feedback
- [x] Mejorar UI/UX de inputs (estilo, consistencia y legibilidad).
- [x] Formatear valores numéricos con **separador de miles**.
- [x] Agregar **tooltips explicativos** en cada input con:
  - [x] restricciones y guía de uso (ej. "solo enteros", rangos válidos)
  - [x] un enunciado teórico **muy breve** del significado del parámetro
- [x] Implementar librería de **toasts** para notificaciones.
- [x] Mostrar **errores de validación** mediante toasts.

## Generador de cuadrados medios: robustez
- [x] Revisar y mejorar los algoritmos; detectar y corregir falencias, especialmente en **Cuadrados Medios**.
- [x] Mejorar la tabla de resultados de Cuadrados Medios para mostrar explícitamente:
  - [x] datos de la izquierda
  - [x] datos de la derecha
  - [x] datos de la mitad
- [x] En parámetros del generador de Cuadrados Medios, manejar **D** con:
  - [x] valor por defecto: `4`
  - [x] opción para que el usuario lo modifique
  - [x] validación: `n >= 4`
  - [x] validación: `n` debe ser par
- [x] Mostrar mensaje educativo cuando la semilla sea **degenerada** (ej. converge a 0), explicando por qué ocurre la degeneración.

## Visualización de resultados y pruebas estadísticas
- [x] Mejorar UI de la tabla de resultados en el tab **Generador**.
- [x] Mejorar sección de **pruebas estadísticas** para que cada prueba pueda expandir su gráfica.
- [x] Al expandir una prueba estadística, incluir explicación educativa:
  - [x] qué evalúa la prueba
  - [x] cómo se realiza
  - [x] apoyo con animaciones explicativas
- [x] En el card **Secuencia Generada**, agregar explicación de la gráfica debajo del chart. Ademas agregar tambien la funcionalidad de expancion de esta grafica.
- [x] En la gráfica de **Secuencia Generada**, agregar líneas verticales explicativas para indicar período o repetición de valores.

## Tab Comparar
- [x] En el tab **Comparar**, agregar inputs para parámetros necesarios de los distintos generadores.
- [x] En tab **Comparar**, después de resultados de comparación, agregar una tabla con solo el valor **Ri** de cada modelo.
- [x] En tab **Comparar**, permitir visualizar también la **gráfica de la prueba** (igual que en el tab Generador), para facilitar el análisis visual entre modelos.
