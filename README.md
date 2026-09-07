# 🏛️ Iniciativa Ciudadana: Mandato de Ley

### *Activismo Tycoon* — Serious game de simulación legislativa mexicana

[![CI](https://github.com/hugolemoy/legalizalatycoon/actions/workflows/ci.yml/badge.svg)](https://github.com/hugolemoy/legalizalatycoon/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue.svg)](LICENSE)
[![Contenido: CC BY-NC-SA 4.0](https://img.shields.io/badge/contenido-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE-CONTENT)

Llevas una demanda ciudadana desde un reglamento municipal hasta una reforma federal
publicada en el **Diario Oficial de la Federación**. Tienes **100 semanas**, 40 horas
por semana y un cuerpo que se cansa.

No ganas por tener la razón moral. Ganas por dominar la técnica parlamentaria sin
quemar al colectivo en el intento.

---

## 🎯 Qué es esto

Prueba de concepto (POC) jugable de un *serious game* construido sobre la teoría de
**retórica procedimental** de Ian Bogost: el juego no enseña con textos ni sermones,
sino con sus reglas matemáticas, sus cuellos de botella y sus consecuencias inevitables.

**Causa emblemática de la POC:** Regulación Integral del Cannabis en México — el
ejemplo paradigmático de una lucha legislativa que atraviesa los tres órdenes de gobierno.

| | |
| :--- | :--- |
| **Género** | Serious game · Simulación política y de recursos |
| **Duración de partida** | 100 semanas (≈ 2 años de legislatura) |
| **Stack** | Vite + TypeScript + React + Tailwind CSS |
| **Ejecución** | 100% client-side, sin backend, sin base de datos |
| **Costo operativo** | $0.00 USD / mes |

---

## 🚀 Arranque rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. La partida se guarda sola en `localStorage`.

### Simulación headless (sin navegador)

El motor es TypeScript puro, así que se puede jugar entero desde la consola:

```bash
npm run sim
```

```bash
npm run sim:matriz
```

`npm run sim` corre 100 semanas con un bot estratega e imprime la traza semanal de
recursos, fases y reloj legislativo. `npm run sim:matriz` compara cuatro arquetipos
de jugador y sus desenlaces:

| Política | Desenlace típico | Lección |
| :--- | :--- | :--- |
| Estratega colectivo | `VICTORIA_DOF` (semana 87) | Delegar y descansar es estrategia |
| Pragmático | `VICTORIA_DOF` con concesiones | Se puede ganar la foto y perder la ley |
| Líder mártir | `DERROTA_BURNOUT` (semana 5) | La autoexplotación no escala |
| Observador pasivo | `DERROTA_CONGELADORA` (semana 24) | El tiempo parlamentario corre solo |

### Otros comandos

```bash
npm run test
```

```bash
npm run verify
```

`verify` encadena lint + pruebas + build; es lo mismo que corre la CI.

---

## 🧠 Arquitectura: Lógica Pura Desacoplada

El principio innegociable del proyecto es que el motor de simulación **no sabe que
existe una interfaz gráfica**.

```
┌────────────────────────────────────────────────────────┐
│           src/engine — CORE SIMULATION ENGINE          │
│  TypeScript puro · sin React · sin DOM · sin fetch     │
│  Máquina de estados · Economía de recursos             │
│  Reloj legislativo · Despachadores por umbral          │
└───────────────────────────┬────────────────────────────┘
                            │  ejecutarComando(estado, comando) → estado nuevo
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌───────────────────┐      ┌───────────────────────┐
    │  src/ui  (React)  │      │  src/sim  (headless)  │
    │  Tablero War Room │      │  Bots y trazas de CLI │
    └───────────────────┘      └───────────────────────┘
```

Consecuencias prácticas:

* Las pruebas de 100 semanas corren en **milisegundos**, sin navegador ni jsdom.
* Una prueba automatizada verifica que ningún archivo de `src/engine/` mencione
  `document`, `window`, `localStorage` o `react`.
* `ejecutarComando` **nunca muta** el estado que recibe: devuelve uno nuevo.
* Misma semilla ⇒ misma partida, bit por bit.

El detalle completo —fórmulas, orden del ciclo semanal, decisiones de balanceo y
desviaciones documentadas respecto de la especificación— está en
[`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

---

## 🎮 Cómo se juega

Cada turno es una semana. El bucle tiene cuatro movimientos:

1. **Reparte tus 40 horas** entre los cuatro verbos operativos:
   *Investigar/Redactar*, *Movilizar*, *Cabildear* y *Autocuidado*.
2. **Recluta y delega.** Sofía (abogada), Mateo (vocero) y Lupita (enlace de base)
   traen sus propias 20 horas semanales, que **no salen de tu resistencia**.
3. **Cabildea legisladores** uno por uno, gastando Presión Política. Un opositor
   necesita dos sesiones para llegar a "a favor".
4. **Cierra la semana** y aguanta los drenajes pasivos.

### Los cuatro recursos

| Recurso | Qué es | Cómo te mata |
| :--- | :--- | :--- |
| **Apoyo Social** | Legitimidad en calles y comunidades | Bajo 25% el movimiento se fractura |
| **Presión Política** | Capacidad de mover votos y agendar | Sobre 80% despiertas al aparato del Estado |
| **Resistencia** | Tu salud mental y física | Bajo 30% entra la niebla mental; en 0% se acabó |
| **Solidez Técnica** | Calidad jurídica del articulado | Sin ella te devuelven el dictamen aunque tengas los votos |

### Los tres momentos que definen la partida

* **Semana 48 — Descanso Forzado Obligatorio.** El cuerpo dice basta y quedas
  inhabilitado tres semanas. Si construiste un colectivo (≥2 aliados), el equipo
  sostiene la iniciativa y el reloj legislativo se detiene. Si centralizaste todo,
  pierdes 3 semanas de reloj y 25% de apoyo social. El juego lo resuelve con un
  **Informe de Contingencia**, no con melodrama.
* **La congeladora.** Cada comisión tiene 12 semanas para dictaminar. Si el reloj
  llega a cero, el expediente se archiva. No hay votación en contra: hay calendario.
* **El dictamen mutilado.** Cuando quedan 3 semanas de reloj, las bancadas ofrecen
  aprobar la ley a cambio de quitarle el autocultivo y el presupuesto. Aceptar te
  da la victoria en la foto y una ley sin dientes en el epílogo.

---

## 🖥️ La interfaz: War Room táctico

* **Vista dual intercambiable** — un toggle alterna entre el **expediente
  burocrático físico** (carpeta manila con sellos de tinta) y el **mapa de nodos**
  (diagrama SVG de la ruta parlamentaria completa, con sus cuellos de botella).
* **Semáforo parlamentario** — cada legislador es una tarjeta con el color de su
  bancada y un punto 🟢🟡🔴 según su postura.
* **Niebla mental** — bajo 30% de Resistencia la pantalla se viñetea, aparecen
  pensamientos intrusivos en los márgenes (etiquetados con la distorsión cognitiva
  que representan) y **las estimaciones en pantalla se distorsionan con sesgo
  pesimista**. El motor sigue calculando bien; el que ya no lee bien eres tú.

Todos los assets son **procedimentales**: los sellos son CSS con tipografía
desgastada y doble borde, el mapa es SVG en el DOM y la viñeta es un
`radial-gradient`. Cero imágenes, bundle de ~74 KB gzip.

---

## 📂 Estructura del repositorio

```
src/
├── engine/              Core Engine (TypeScript puro, sin DOM)
│   ├── types.ts         Esquema de estado normativo + extensiones POC
│   ├── balance.ts       TODAS las constantes numéricas del juego
│   ├── motor.ts         El ciclo semanal y la frontera pública
│   ├── acciones.ts      Comandos del jugador dentro de la semana
│   ├── legislativo.ts   Dictámenes, congeladora, plenos y desenlaces
│   ├── disparadores.ts  Eventos por umbral crítico y Event Deck
│   ├── selectores.ts    Derivados puros para la UI
│   ├── data/            Comisiones, bancadas, colectivo, ruta, narrativa
│   └── __tests__/       69 pruebas (las 4 de la guía + unitarias)
├── sim/                 Simulación headless y bots
└── ui/                  React + Tailwind (no contiene reglas de juego)

docs/                    GDD, guía técnica, bitácora, pitch y arquitectura
```

**Regla del proyecto:** ningún módulo del motor puede tener números mágicos.
Ajustar el balanceo es editar `src/engine/balance.ts` y volver a correr
`npm run test` + `npm run sim`.

---

## 📚 Documentación de diseño

| Documento | Contenido |
| :--- | :--- |
| [`docs/GDD_Iniciativa_Ciudadana.md`](docs/GDD_Iniciativa_Ciudadana.md) | Game Design Document maestro v1.0 |
| [`docs/GUIA_AGENTE_DEV_POC.md`](docs/GUIA_AGENTE_DEV_POC.md) | Especificación técnica de la POC (fuente normativa) |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Cómo se implementó y por qué; decisiones de balanceo |
| [`docs/BITACORA.md`](docs/BITACORA.md) | Memoria histórica de decisiones de diseño |
| [`docs/PITCH_DECK_Iniciativa_Ciudadana.md`](docs/PITCH_DECK_Iniciativa_Ciudadana.md) | Presentación ejecutiva |

---

## 🚢 Despliegue

Sitio estático servido desde la raíz del dominio. Compila con `npm run build` y
publica `dist/`.

* **Cloudflare Pages / Vercel** (objetivo actual): build `npm run build`,
  directorio de salida `dist`. Sin configuración extra.
* **GitHub Pages** bajo subruta: `BASE_PATH=/legalizalatycoon/ npm run build`.
  No hace falta tocar código.

---

## 🤝 Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md). En corto: la lógica va en `src/engine`,
los números en `balance.ts`, y todo cambio de balanceo se justifica con la salida
de `npm run sim`.

---

## ⚖️ Licencias

Este repositorio usa licenciamiento dual:

* **Código fuente** (`src/`, configuración, scripts) — [MIT](LICENSE).
* **Contenido de diseño y narrativa** (`docs/`, textos de juego, GDD, bitácora) —
  [CC BY-NC-SA 4.0](LICENSE-CONTENT).

---

## 📝 Nota sobre las bancadas

Los partidos que aparecen en el juego (*Movimiento de la Deformación*, *Partido
Tradición y Orden*, *Frente Institucional del Poder*, *Partido Ecologista
Pragmático*) son **parodias ficticias**. No representan a organizaciones políticas
reales ni a personas reales; los legisladores son personajes inventados. La sátira
apunta a prácticas parlamentarias documentadas, no a militancias.
