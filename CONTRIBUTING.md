# 🤝 Cómo contribuir

Gracias por el interés. Este es un *serious game* educativo: las contribuciones
pueden ser código, balanceo, contenido narrativo o revisión de la fidelidad
institucional del modelo legislativo.

---

## Antes de empezar

```bash
npm install
npm run verify
```

`verify` corre lint + pruebas + build. Si pasa en limpio, tu entorno está listo.

Node ≥ 20.11 (la versión exacta está en `.nvmrc`).

---

## Las tres reglas del proyecto

### 1. La lógica de juego vive en `src/engine`, y solo ahí

El motor es TypeScript puro. No puede importar React, tocar el DOM, leer
`localStorage` ni hacer `fetch`. Hay una prueba automatizada y una regla de ESLint
que lo verifican; si las rompes, la CI te lo dirá.

Si un componente de React necesita un cálculo derivado (un color, un porcentaje, un
checklist), ese cálculo va en `src/engine/selectores.ts`, no en el componente.

### 2. Ningún número mágico fuera de `balance.ts`

Todas las constantes numéricas del juego viven en
[`src/engine/balance.ts`](src/engine/balance.ts). Si tu cambio introduce un número,
va ahí, con nombre y comentario que explique de dónde sale.

### 3. Todo cambio de balanceo se justifica con simulación

```bash
npm run sim:matriz
```

Pega la salida en tu Pull Request, antes y después del cambio. El criterio de
"balanceo correcto" del proyecto es que los cuatro arquetipos de jugador produzcan
cuatro desenlaces distintos y coherentes con la tesis pedagógica:

| Política | Desenlace esperado |
| :--- | :--- |
| Estratega colectivo | `VICTORIA_DOF` |
| Pragmático | `VICTORIA_DOF` (con concesiones) |
| Líder mártir | `DERROTA_BURNOUT` |
| Observador pasivo | `DERROTA_CONGELADORA` |

Si un arquetipo cambia de desenlace, la lección pedagógica cambió con él. Explica
por qué en el PR.

---

## Fidelidad a los documentos de diseño

Este proyecto tiene documentos normativos. En caso de conflicto, el orden de
autoridad es:

1. [`docs/GUIA_AGENTE_DEV_POC.md`](docs/GUIA_AGENTE_DEV_POC.md) — especificación de
   implementación. Manda sobre fórmulas, tipos y umbrales.
2. [`docs/GDD_Iniciativa_Ciudadana.md`](docs/GDD_Iniciativa_Ciudadana.md) — diseño de
   juego. Manda sobre intención, tono y pedagogía.
3. [`docs/BITACORA.md`](docs/BITACORA.md) — memoria de decisiones acordadas.

Si tu cambio se aparta de alguno de los tres, **documéntalo** en
[`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md), sección 5 (Desviaciones documentadas),
explicando qué dice la especificación, qué hace la implementación y por qué.

---

## Estilo de código

* **Español mexicano** para nombres de dominio (`comisionActiva`, `apoyoSocial`,
  `avanzarSemana`). No es una preferencia estética: el modelo de datos habla el
  idioma del sistema político que simula, y eso hace el código legible para quien
  conoce el dominio pero no el inglés técnico.
* Comentarios que expliquen **por qué**, no qué. El qué se lee en el código.
* Cada módulo del motor abre con un bloque que cita la sección de la GUÍA o del GDD
  que implementa.
* Prettier no está configurado como hook; sigue el estilo del archivo que tocas
  (2 espacios, comillas simples, punto y coma).

---

## Pruebas

Toda mecánica nueva del motor necesita pruebas. Están en
`src/engine/__tests__/` y corren con Vitest en Node (sin jsdom):

```bash
npm run test
```

```bash
npm run test:watch
```

Helpers disponibles en `__tests__/ayudas.ts`:

* `avanzarSemanas(estado, n)` — avanza turnos resolviendo dilemas con la opción de
  status quo.
* `avanzarSemanasEnLaboratorio(estado, n)` — avanza sin comisión activa, para medir
  drenajes y calendario de fases de forma aislada.
* `estadoSinComision(semilla)` — estado de laboratorio.

---

## Áreas donde hace falta ayuda

Ver [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md), sección 10 (Deuda técnica).
En corto:

* **Ritmo de los recesos entre fases** — un jugador eficiente se queda ~20 semanas
  sin comisión activa. Hace falta contenido para esas ventanas.
* **Pruebas de componentes React** — la UI se validó a mano; falta Testing Library.
* **Ampliar el Event Deck** — hoy son cinco cartas, una vez por partida.
* **Accesibilidad** — falta una pasada de navegación por teclado y contraste AA.
* **Revisión institucional** — si conoces el proceso legislativo mexicano y algo del
  modelo te parece impreciso, abre un issue con la referencia. Ese tipo de
  contribución es la más valiosa para un juego educativo.

---

## Pull Requests

* Rama desde `main`, nombre descriptivo (`balanceo/fase-federal`,
  `motor/reloj-senado`).
* Un PR, un tema.
* Describe **qué cambia para el jugador**, no solo qué cambia en el código.
* Si tocaste `balance.ts`, incluye la salida de `npm run sim:matriz`.
* La CI debe pasar en verde.

---

## Licencias

Al contribuir aceptas que tu aportación se distribuya bajo las licencias del
proyecto: **MIT** para código y **CC BY-NC-SA 4.0** para contenido de diseño y
narrativa. Ver [`LICENSE`](LICENSE) y [`LICENSE-CONTENT`](LICENSE-CONTENT).

---

## Sobre el contenido satírico

Las bancadas del juego son parodias ficticias de prácticas parlamentarias
documentadas, no de organizaciones ni personas reales. Las contribuciones de
contenido deben mantenerse en ese registro: **sátira de procedimientos e incentivos,
nunca ataque a militancias, personas identificables o grupos**. Los PR que crucen esa
línea se cierran sin discusión.
