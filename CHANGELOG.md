# 📋 Registro de cambios

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

## [0.3.0] — 2026-09-08

Iteración v2.2. Corresponde a la Entrada #016 de la
[bitácora de diseño](docs/BITACORA.md) y a la
[guía del Nivel 0 y la remediación](docs/GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md).

### Añadido

- **Nivel 0 interactivo "El Rescate de Gael".** Sub-estado `PROLOGO_NIVEL_0`
  previo a la Semana 1, jugado como chat de red vecinal: tres micro-pasos
  tácticos (documentar el IPH, movilizar al MP, escalar a Derechos Humanos),
  una salida bloqueada pedagógicamente (pagar la mordida) y la epifanía que
  activa el Art. 71 fr. IV. Módulos nuevos: `engine/nivel0.ts`,
  `engine/data/nivel0.ts` y `ui/components/ChatNivel0.tsx`.
- **Gael Martínez como aliado reclutable** con el rol
  `ACTIVISTA_TERRITORIAL`, ×1.25 en recolección de firmas y desbloqueo por
  fase estatal o 500 firmas.
- **El embudo se estira.** Dos etapas de trámite nuevas —Foro de Parlamento
  Abierto y Comisión de Hacienda— que se cuentan en sesiones y no en votos, más
  la espera del dictamen en el orden del día del Pleno. Campo `tipo` en
  `Comision`, con `semanasTramite`, `apoyoSocialRequerido` y
  `seOmiteSiMutilada`.
- **Ventanas de remediación.** Receso parlamentario fijo de 6 semanas entre
  fases, sin reloj de la congeladora y con decaimiento de presión al ritmo
  base. La siguiente fase abre en `min(corte del calendario, fin del receso)`.
- **Telemetría anónima de learning analytics** (`engine/telemetria.ts`): siete
  eventos del embudo cívico acumulados en el estado y drenados por `useJuego`.
  Sin cookies, sin identificadores y sin texto libre del jugador.
- **`npm run sim:ritmo`**, diagnóstico de en qué semana abre y cierra cada
  etapa del embudo.
- Pruebas nuevas: `nivel0.test.ts` (13) y `ritmo.test.ts` (16).

### Cambiado

- **El dilema de la ley mutilada tiene un segundo disparador:** entrar a la
  Comisión de Presupuesto. Con el embudo estirado el reloj casi nunca baja de
  tres semanas, así que el dilema ético se había vuelto inalcanzable. Ahora el
  chantaje es más limpio y más real: sin presupuesto, Hacienda no tiene qué
  dictaminar y te ahorras la comisión entera.
- **Recalibración municipal:** la Comisión de Gobernación exige 5 de 7 votos
  (antes 4) y 35% de Solidez Técnica (antes 30).
- **Recursos de arranque** definidos por el Nivel 0: Apoyo 35%, Solidez 15%,
  Resistencia 90%. La Presión Política que el chat acumula no se transfiere.
- `verificarCalendarioDeFases` verifica un contrato nuevo: las fases nunca
  retroceden y ninguna abre después de su corte de calendario, pero pueden
  abrir antes si el jugador cerró su embudo.
- La clave de partida guardada sube a `iniciativa-ciudadana:partida:v22`.

### Eliminado

- `PrologoModal.tsx`, sustituido por el chat del Nivel 0.

### Medición

- `npm run sim:huecos`: **54 → 13 semanas muertas** por partida, idéntico en
  las seis semillas. Criterio de aceptación de la guía (< 15) cumplido.
- Matriz de arquetipos: Estratega `VICTORIA_DOF` sem 85 · Pragmático
  `VICTORIA_DOF` **mutilada** sem 76 · Líder mártir `DERROTA_BURNOUT` sem 4 ·
  Observador pasivo `DERROTA_CONGELADORA` sem 21.

## [0.3.0] — 2026-09-08

Iteración v2.2. Corresponde a la Entrada #016 de la
[bitácora de diseño](docs/BITACORA.md) y a la
[guía del Nivel 0 y la remediación](docs/GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md).

### Añadido

- **Nivel 0 interactivo "El Rescate de Gael".** Sub-estado `PROLOGO_NIVEL_0`
  previo a la Semana 1, jugado como chat de red vecinal: tres micro-pasos
  tácticos (documentar el IPH, movilizar al MP, escalar a Derechos Humanos),
  una salida bloqueada pedagógicamente (pagar la mordida) y la epifanía que
  activa el Art. 71 fr. IV. Módulos nuevos: `engine/nivel0.ts`,
  `engine/data/nivel0.ts` y `ui/components/ChatNivel0.tsx`.
- **Gael Martínez como aliado reclutable** con el rol
  `ACTIVISTA_TERRITORIAL`, ×1.25 en recolección de firmas y desbloqueo por
  fase estatal o 500 firmas.
- **El embudo se estira.** Dos etapas de trámite nuevas —Foro de Parlamento
  Abierto y Comisión de Hacienda— que se cuentan en sesiones y no en votos, más
  la espera del dictamen en el orden del día del Pleno. Campo `tipo` en
  `Comision`, con `semanasTramite`, `apoyoSocialRequerido` y
  `seOmiteSiMutilada`.
- **Ventanas de remediación.** Receso parlamentario fijo de 6 semanas entre
  fases, sin reloj de la congeladora y con decaimiento de presión al ritmo
  base. La siguiente fase abre en `min(corte del calendario, fin del receso)`.
- **Telemetría anónima de learning analytics** (`engine/telemetria.ts`): siete
  eventos del embudo cívico acumulados en el estado y drenados por `useJuego`.
  Sin cookies, sin identificadores y sin texto libre del jugador.
- **`npm run sim:ritmo`**, diagnóstico de en qué semana abre y cierra cada
  etapa del embudo.
- Pruebas nuevas: `nivel0.test.ts` (13) y `ritmo.test.ts` (16).

### Cambiado

- **El dilema de la ley mutilada tiene un segundo disparador:** entrar a la
  Comisión de Presupuesto. Con el embudo estirado el reloj casi nunca baja de
  tres semanas, así que el dilema ético se había vuelto inalcanzable. Ahora el
  chantaje es más limpio y más real: sin presupuesto, Hacienda no tiene qué
  dictaminar y te ahorras la comisión entera.
- **Recalibración municipal:** la Comisión de Gobernación exige 5 de 7 votos
  (antes 4) y 35% de Solidez Técnica (antes 30).
- **Recursos de arranque** definidos por el Nivel 0: Apoyo 35%, Solidez 15%,
  Resistencia 90%. La Presión Política que el chat acumula no se transfiere.
- `verificarCalendarioDeFases` verifica un contrato nuevo: las fases nunca
  retroceden y ninguna abre después de su corte de calendario, pero pueden
  abrir antes si el jugador cerró su embudo.
- La clave de partida guardada sube a `iniciativa-ciudadana:partida:v22`.

### Eliminado

- `PrologoModal.tsx`, sustituido por el chat del Nivel 0.

### Medición

- `npm run sim:huecos`: **54 → 13 semanas muertas** por partida, idéntico en
  las seis semillas. Criterio de aceptación de la guía (< 15) cumplido.
- Matriz de arquetipos: Estratega `VICTORIA_DOF` sem 85 · Pragmático
  `VICTORIA_DOF` **mutilada** sem 76 · Líder mártir `DERROTA_BURNOUT` sem 4 ·
  Observador pasivo `DERROTA_CONGELADORA` sem 21.

## [0.2.0] — 2026-09-07

Refinamiento v2.0. Corresponde a las Entradas #012 y #013 de la
[bitácora de diseño](docs/BITACORA.md) y a la
[guía de refinamiento](docs/GUIA_REFINAMIENTO_UX_BALANCE_POC.md).

### Añadido

- **Progresión escalonada del early game.** Tres etapas durante la fase municipal:
  activista solitario (1-3) con Cuartel y Comisión bloqueados, apertura del
  colectivo (4) y validación en Oficialía de Partes (6). Campos nuevos:
  `firmasRecolectadas`, `colectivoDesbloqueado`, `comisionDesbloqueada`,
  `onboardingCompletado`, `hitoPendiente` y `gacetaPendiente`.
- **Firmas ciudadanas** como recurso del Art. 71 frac. IV, alimentadas por Movilizar
  a 9 firmas/hora sin curva de saturación. Meta de la Etapa A: 500.
- **Prólogo narrativo:** modal de expediente policial con el caso de Gael.
- **Wizard de onboarding** en cuatro pasos con spotlight, navegación por teclado,
  opción de omitir y memoria en `localStorage`.
- **Transición de semana:** bloqueo de 600 ms, sello burocrático con rotación,
  deltas flotantes y golpe de madera sintetizado en Web Audio, silenciable.
- **Gaceta Semanal:** pop-up de prensa satírica cada dos semanas con el catálogo
  completo por fase.
- **Tooltips** de bancadas y glosario parlamentario, accesibles por cursor, foco
  de teclado y toque.
- **Paneles bloqueados** con candado, motivo y cuenta regresiva de semanas.
- 13 pruebas nuevas en `balance_early_game.test.ts`. Suite total: 82.

### Corregido

- **Estado muerto al aceptar el dictamen mutilado.** El motor marcaba el dictamen
  como aprobado pero no alineaba los votos ni sellaba el nodo de la comisión. El
  jugador superaba el Senado y la condición de victoria federal (≥65% de votos en
  Diputados) quedaba imposible de cumplir para siempre, sin acción disponible para
  corregirlo. Ahora el trato incluye los votos, que es lo que las bancadas están
  vendiendo. El arquetipo Pragmático vuelve a ganar, y lo hace con la ley mutilada.

### Cambiado

- Reloj de la congeladora municipal: de 24 a 16 semanas, y arranca en la semana 6.
- La abogada pro-bono pasa de Sofía a **Mariana Rendón** (Entrada #012).
- Cadencia de la Gaceta: de 4 a 2 semanas.
- Node requerido: ≥ 22 (lo exige wrangler 4.x para el despliegue).

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

[No publicado]: https://github.com/HugoLeMoy47/LegalizalaTycoon/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/HugoLeMoy47/LegalizalaTycoon/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/HugoLeMoy47/LegalizalaTycoon/releases/tag/v0.1.0
