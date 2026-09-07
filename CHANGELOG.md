# 📋 Registro de cambios

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

## [0.1.0] — 2026-09-06

Primera prueba de concepto jugable. Corresponde a la Entrada #011 de la
[bitácora de diseño](docs/BITACORA.md).

### Añadido

**Core Engine (`src/engine`) — TypeScript puro, sin DOM**

- Máquina de estados de 100 semanas con tres fases (Municipal 1-30, Estatal 31-65,
  Federal 66-100) y el ciclo semanal completo de la especificación técnica.
- Economía de recursos: Apoyo Social, Presión Política, Resistencia, Solidez Técnica,
  Fondos y presupuesto de horas, con rendimientos decrecientes por saturación.
- Mecánica de autoexplotación "Meter Horas Extra" con multiplicador de fatiga acumulada
  a partir de la tercera semana consecutiva.
- Sistema legislativo: comisiones dictaminadoras, reloj de la congeladora, compuerta de
  solidez técnica, votación en Pleno y sistema bicameral federal.
- Cabildeo directo a legisladores con costo en Presión Política, y compra de votos a la
  bancada satélite con costo en Fondos y en Apoyo Social.
- Sistema de reclutamiento y delegación del colectivo (abogada, vocería y enlace de
  base), con horas propias que no consumen la Resistencia del líder.
- Despachadores de eventos por umbral crítico: Alerta del Régimen (presión ≥ 80),
  ruptura interna (apoyo < 25), oferta de dictamen mutilado (reloj ≤ 3) y cesión de
  autoría a la bancada mayoritaria.
- Crisis obligatoria de la Semana 48 con Descanso Forzado (semanas 48-50) e Informe de
  Contingencia del Colectivo.
- Event Deck de cinco cartas con azar determinista sembrado por semilla.
- Generador pseudoaleatorio determinista (mulberry32) dentro del estado: misma semilla,
  misma partida.
- Frontera pública inmutable: `ejecutarComando(estado, comando)` nunca muta su entrada.

**Simulación headless (`src/sim`)**

- Runner de partidas completas sin navegador y cuatro políticas de juego automático
  (estratega colectivo, pragmático, líder mártir, observador pasivo).
- CLI `npm run sim` con traza semanal y `npm run sim:matriz` con comparativa de
  arquetipos.

**Interfaz War Room (`src/ui`) — React + Tailwind**

- Dashboard con contador de semana, fase, barras de recursos con deltas y umbrales
  marcados, y contador de horas con botón pulsante de horas extra.
- Vista dual intercambiable: expediente burocrático físico con sellos de tinta
  procedimentales, y mapa de nodos SVG de la ruta parlamentaria completa.
- Panel de comisión con semáforo parlamentario, tarjetas de legislador por bancada y
  reloj de la congeladora.
- Módulo de Niebla Mental: viñeteado proporcional a la Resistencia, pensamientos
  intrusivos etiquetados con su distorsión cognitiva y sesgo pesimista en las
  estimaciones mostradas.
- Modales de dilema ético, Informe de Contingencia de la Semana 48 y pantallas de
  desenlace (promulgación en el DOF, congeladora, colapso).
- Persistencia de la partida en `localStorage` con degradación silenciosa.

**Pruebas y calidad**

- 69 pruebas en Vitest cubriendo las cuatro pruebas del plan de validación de la guía
  técnica, más disparadores, inmutabilidad, determinismo y desacoplamiento.
- Prueba automatizada que verifica que ningún módulo del motor referencie el DOM o
  React, reforzada con una regla de ESLint acotada.
- Flujo de integración continua que corre lint, tipos, pruebas, simulación de 100
  semanas y build de producción.

**Documentación**

- README, documento de arquitectura con las desviaciones documentadas respecto de la
  especificación, guía de contribución, código de conducta, política de seguridad y
  licenciamiento dual (MIT para código, CC BY-NC-SA 4.0 para contenido).

### Ajustes de balanceo detectados por simulación

- Se añadieron rendimientos decrecientes por saturación: sin ellos, todos los recursos
  se estabilizaban al 95-100% hacia la semana 10 y la partida perdía su tensión.
- Se añadió decaimiento de la Presión Política, proporcional cuando no hay comisión
  activa: sin él, el jugador acumulaba presión durante los recesos y resolvía la
  siguiente fase en cuatro semanas.
- El Apoyo Social inicial pasó de 25% a 30%: con 25% el primer drenaje semanal detonaba
  el evento de ruptura interna en la semana 1.

[No publicado]: https://github.com/hugolemoy/legalizalatycoon/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/hugolemoy/legalizalatycoon/releases/tag/v0.1.0
