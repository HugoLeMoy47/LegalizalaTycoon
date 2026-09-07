# 🏗️ Arquitectura de la POC

> Documento de implementación. Explica **cómo** se construyó la prueba de concepto,
> **por qué** se tomaron ciertas decisiones y **en qué puntos** la implementación se
> desvía —conscientemente— de la especificación.
>
> Fuentes normativas: [`GUIA_AGENTE_DEV_POC.md`](GUIA_AGENTE_DEV_POC.md) (especificación
> técnica), [`GDD_Iniciativa_Ciudadana.md`](GDD_Iniciativa_Ciudadana.md) (diseño de juego)
> y [`BITACORA.md`](BITACORA.md) entrada #010 (stack y despliegue).

---

## 1. El principio innegociable

> *"El motor de simulación debe estar estrictamente desacoplado de la interfaz gráfica."*
> — GUÍA, sección 1

Esto no es una recomendación estilística: es lo que permite que las 100 semanas se
simulen en milisegundos y que el balanceo se valide sin abrir un navegador.

```
                    ejecutarComando(estado, comando) → { estado, ok, mensaje }
                                        ▲
        ┌───────────────────────────────┴───────────────────────────────┐
        │                                                               │
┌───────┴────────┐                                            ┌─────────┴──────┐
│  src/ui        │                                            │  src/sim       │
│  React+Tailwind│                                            │  Bots headless │
│  Cero reglas   │                                            │  CLI + trazas  │
└────────────────┘                                            └────────────────┘
```

### Cómo se hace cumplir

| Mecanismo | Dónde |
| :--- | :--- |
| Prueba automatizada que escanea `src/engine/**` buscando `document`, `window`, `localStorage`, `from 'react'` | [`pureza.test.ts`](../src/engine/__tests__/pureza.test.ts) |
| Regla de ESLint `no-restricted-globals` acotada a `src/engine/**` | [`eslint.config.js`](../eslint.config.js) |
| Prueba de inmutabilidad: `ejecutarComando` no muta su entrada | `pureza.test.ts` |
| Prueba de determinismo: misma semilla ⇒ mismo estado tras 25 turnos | `pureza.test.ts` |

La capa de presentación consume el motor por **una sola puerta**: el hook
[`useJuego`](../src/ui/hooks/useJuego.ts), que envuelve `ejecutarComando`, guarda el
estado en `useState` y lo persiste en `localStorage`. Ningún componente calcula reglas
de juego; los derivados cosméticos (colores de barra, checklists, estimaciones
distorsionadas) viven en [`selectores.ts`](../src/engine/selectores.ts), dentro del motor.

---

## 2. El ciclo semanal

Implementa literalmente la sección 3.A de la GUÍA. El paso 0 se antepone porque el
trabajo de la semana ocurre **antes** de que el cuerpo pase la factura.

| # | Paso | Fórmula | Módulo |
| :-- | :--- | :--- | :--- |
| 0 | Resolución de horas asignadas | ver §3 | `acciones.ts` |
| 1 | Consumo de horas extra | `resistencia -= (extra/10) × 15 × fatiga` | `motor.ts` |
| 2 | Drenaje pasivo por fase | `-0.5` / `-1.5` / `-4.0` | `motor.ts` |
| 3 | Drenaje de apoyo por presión † | `apoyo -= presión × 0.05` | `motor.ts` |
| 3.1 | Decaimiento de presión política | ver §4.2 (extensión) | `motor.ts` |
| 3.5 | Reloj legislativo: dictamen y Pleno † | — | `legislativo.ts` |
| 4 | Reloj de la congeladora † | `-1` semana; a 0 ⇒ `congelada` | `legislativo.ts` |
| 4.5 | Economía blanda y despachadores por umbral | — | `disparadores.ts` |
| 5 | Chequeo de niebla mental | `niebla = resistencia < 30` | `motor.ts` |
| 6 | Incremento de semana | `semanaActual += 1` | `motor.ts` |
| 6.5 | Desbloqueos escalonados, gaceta, fase, Semana 48 y desenlaces | — | `motor.ts` / `legislativo.ts` |

† **v2.0:** estos tres pasos solo corren con `comisionDesbloqueada === true`. Antes
de la semana 6 no hay expediente en el Congreso, así que no hay reloj que correr,
ni dictamen que resolver, ni negociación de la que las bases puedan sospechar.

**Nota sobre el orden.** Sumar el rendimiento del autocuidado antes de restar el costo
de las horas extra es aritméticamente equivalente salvo por el acotado en 0 y 100. Se
eligió este orden porque narrativamente el trabajo ya ocurrió cuando llega el cansancio.

---

## 3. Economía de recursos

### 3.1 Los cuatro verbos

Cada hora asignada produce `base × factorEspecialista × factorSaturación`:

| Verbo | Base por hora | Produce | Especialista (×) |
| :--- | ---: | :--- | :--- |
| Investigar / Redactar | 0.55 | Solidez Técnica | Abogada ×1.6 |
| Movilizar | 0.42 | Apoyo Social | Enlace de base ×1.5 |
| Cabildear | 0.80 | Presión Política × conversión de fase | Vocero ×1.5 |
| Autocuidado | 0.55 | Resistencia | — |

Cabildear además consume `0.22 × horas` de Apoyo Social: negociar en los pasillos
genera sospecha en las bases (pilar 2 del GDD).

### 3.2 Rendimientos decrecientes — extensión no prevista en la especificación

**El problema.** La primera simulación headless con las fórmulas literales de la GUÍA
mostró que todos los recursos se saturaban al 95-100% hacia la semana 10 y la partida
perdía toda tensión durante las 90 semanas restantes.

**La solución.** Cada verbo rinde `base × (1 − recursoActual/100)`, con piso de 0.05.
Los primeros puntos de Apoyo Social salen de una asamblea; los últimos exigen convencer
a quien nunca va a las asambleas. Dormir cuando ya dormiste no repone nada.

Esto crea equilibrios naturales por fase en lugar de topes duros: en fase federal, con
20 horas semanales de autocuidado, la Resistencia se estabiliza cerca del 64% — lo
suficiente para sobrevivir, no lo suficiente para ignorar el problema.

### 3.3 Fondos

Economía blanda (Bitácora #005): no hay bancarrota. Ingreso semanal de
`25 × apoyoSocial` menos `$1,200` de costo operativo. Sirve para reclutar y para
comprar el voto de la bancada satélite.

---

## 4. Extensiones al esquema normativo

Todas las interfaces de la GUÍA (`Recursos`, `Legislador`, `Comision`,
`MiembroColectivo`, `GameState`, `EstadoJuego`) conservan **literalmente** sus campos y
nombres. Lo añadido está agrupado en `types.ts` bajo el comentario `EXTENSIONES POC`.

### 4.1 Campos nuevos y su justificación

| Campo | Por qué existe |
| :--- | :--- |
| `solidezTecnica` | El GDD define *Investigar/Redactar* como uno de los 4 verbos y exige "integridad técnica" para ganar, pero la GUÍA no le da un campo de estado. |
| `asignaciones` | El presupuesto de horas necesita un lugar donde vivir entre comandos. |
| `colaComisiones` / `comisionesResueltas` | La GUÍA modela una sola `comisionActiva`; el embudo real tiene varias por fase. |
| `rutaLegislativa` | Alimenta la vista de Mapa de Nodos (GUÍA 5.2). |
| `sellos` | Alimenta la vista de Expediente Físico (GUÍA 5.2). |
| `registro` | Bitácora estructurada para la UI. `historialEventos: string[]` se mantiene como su espejo plano normativo, verificado por prueba. |
| `decisionPendiente` | Los dilemas modales bloquean el avance de semana. |
| `semilla` / `cursorAleatorio` | PRNG determinista (mulberry32) dentro del estado: misma semilla ⇒ misma partida. |
| `semanasConsecutivasHorasExtra` | Multiplicador de fatiga acumulada (GDD §8). |
| `reporteSemana48` | Informe de Contingencia (GUÍA 4.A). |
| `banderas` / `semanaUltimaCarta` | Disparadores de un solo uso y enfriamiento del Event Deck. |
| `ultimoTurno` | Deltas para el panel de diagnóstico y para los números flotantes de la transición. |
| `firmasRecolectadas` **(v2.0)** | Respaldo ciudadano del Art. 71 frac. IV. Meta de la Etapa A: 500. |
| `colectivoDesbloqueado` / `comisionDesbloqueada` **(v2.0)** | Progresión escalonada del early game (§4.3). |
| `onboardingCompletado` **(v2.0)** | Marca que el jugador recorrió el wizard. Es dato, no comportamiento: el motor no lo lee. |
| `hitoPendiente` / `gacetaPendiente` **(v2.0)** | Anuncios no bloqueantes que la UI muestra y cierra con `CERRAR_HITO` / `CERRAR_GACETA`. |

### 4.2 Mecánicas añadidas

**Decaimiento de la Presión Política.** No está en la especificación. Se añadió porque
sin ella el jugador "embotella" 90% de presión durante los recesos entre fases y
resuelve la siguiente instancia en cuatro semanas. Pierde 1 punto por semana con
comisión activa, y el 12% de lo acumulado (mínimo 3) cuando no hay nada agendado.
La presión política es perecedera: sin asunto en la mesa, los pasillos te olvidan.

**Solidez Técnica como compuerta.** Si tienes los votos pero el texto no alcanza el
mínimo de la comisión, te devuelven el dictamen y pierdes una semana de reloj. Es la
traducción mecánica de "reduce la probabilidad de que las comisiones emitan un dictamen
en contra por errores de constitucionalidad" (GDD §4).

**Votación en Pleno.** Aprobar el dictamen en comisión no basta: la Mesa Directiva
debe agendarlo, lo que exige un mínimo de Presión Política (25% municipal, 50% estatal,
65% diputados, 70% senado). Sin este paso, el embudo del GDD §5 quedaba incompleto.

**Cesión de autoría.** El GDD §6 dice que el *Movimiento de la Deformación* "exige
modificar la autoría de la iniciativa para colgarse la medalla; si no cedes el
protagonismo, congelan el dictamen". Se implementó como dilema modal: ceder alinea de
golpe todos los votos guinda a costa de 15% de apoyo social; negarse cuesta 2 semanas
de reloj.

**Compra de votos.** La bancada satélite (Ecologista Pragmático) tiene
`precioVotoFondos`. Comprar su voto es eficaz, cuesta fondos y resta 4% de apoyo social:
en la asamblea alguien pregunta de dónde salió ese dinero.

**Fricción por niebla mental.** Con Resistencia < 30%, el cabildeo directo tiene 28% de
probabilidad de salir mal: la postura del legislador **empeora** y pierdes apoyo. Es la
traducción mecánica de "las opciones de cabildeo reflejan irritabilidad emocional del
activista" (Bitácora #006).

---

## 4.3 Progresión escalonada del early game (v2.0)

Fuente: `GUIA_REFINAMIENTO_UX_BALANCE_POC.md` §5 y Bitácora #012. Resuelve la
deuda técnica del ritmo inicial registrada en la Entrada #011.

| Etapa | Semanas | Estado del sistema |
| :--- | :--- | :--- |
| A · La recolecta | 1-3 | `colectivoDesbloqueado=false`, `comisionDesbloqueada=false`. El reloj de la congeladora no corre, el drenaje de apoyo por presión no aplica, no se dispara ninguna carta del Event Deck legislativo. Meta: 500 firmas. |
| B · El colectivo | 4-5 | Se abre el Cuartel y la abogada pro-bono se activa **sola**, sin costo de reclutamiento: la atrajeron las firmas. Capacidad: 60 hrs/semana. |
| C · El cabildo | 6-30 | Oficialía de Partes valida: se sellan `TURNADO` y `EN_COMISION`, se activa el nodo de la comisión y arranca el reloj a 16 semanas. |

Los desbloqueos se evalúan **después** de incrementar la semana
(`aplicarDesbloqueosEscalonados`), de modo que el reloj nunca corra en el mismo
turno en que se abre la comisión. Es lo que verifica la prueba de la guía:
semana 6 con reloj en 16, semana 7 con reloj en 15.

### Firmas ciudadanas

`firmasRecolectadas` se alimenta del verbo Movilizar a razón de 9 firmas por
hora, **sin curva de saturación**: una firma es una firma, y el número escala
con el enlace de base porque es quien abre las asambleas. La tasa está calibrada
para que 20 hrs/semana durante las tres semanas de la Etapa A (60 hrs) den 540
firmas, rebasando la meta sin obligar a meter horas extra. Quien sí las mete
llega a la semana 4 exhausto: esa es la lección.

### Feedback sensorial

`hitoPendiente` y `gacetaPendiente` son anuncios no bloqueantes (a diferencia de
`decisionPendiente`, que sí impide avanzar la semana). La UI los cierra con los
comandos `CERRAR_HITO` y `CERRAR_GACETA`. El sonido del sello se sintetiza con
Web Audio en `src/ui/audio/sello.ts` — un seno grave con caída rápida más un
chasquido de ruido filtrado — para no añadir un archivo de audio al bundle.

---

## 5. Desviaciones documentadas respecto de la especificación

| Punto | Especificación | Implementación | Razón |
| :--- | :--- | :--- | :--- |
| Castigo por ley mutilada | GUÍA 4.C dice −35% de apoyo; GDD §7 dice −40% | **−35%** | La GUÍA es la especificación de implementación; el GDD es el documento de diseño. Ante conflicto, manda la GUÍA. |
| Apoyo Social inicial | No especificado | **30%** | Con 25% el primer drenaje semanal lo dejaba en 24.75%, detonando el evento de ruptura interna en la semana 1. Detectado por prueba unitaria. |
| Recuperación en Sem. 48 sin colectivo | No especificada | **+5%/semana** | La GUÍA solo fija +15% con colectivo. Sin él, el líder descansa igual, pero la culpa y la parálisis del proyecto reducen el beneficio del reposo. |
| Reloj durante el Descanso Forzado | "el reloj no sufre penalización" (con colectivo) vs. "se pierden las 3 semanas" (sin) | Con colectivo el reloj **se congela**; sin colectivo **corre normal** | Es la lectura que hace la diferencia mecánicamente legible. |
| Derrota por mutilación total | El GDD §1 la lista como condición de derrota | Se resuelve como `VICTORIA_DOF` con `iniciativaMutilada = true` y epílogo distinto | El tipo `EstadoJuego` de la GUÍA no incluye ese estado. La lección pedagógica se entrega en la pantalla final: *"Ganaste la foto, no la reforma."* |
| Fin de las 100 semanas sin promulgar | No tiene estado propio | `DERROTA_CONGELADORA` | Es lo que ocurre en la realidad: los asuntos no dictaminados se declaran precluidos. |
| Fase municipal | La congeladora se activa en fase estatal (GDD §5) | El cabildo tiene reloj de **16 semanas**, que arranca en la semana 6 | Valor fijado por la guía v2.0 §5.B. "Baja burocracia" no significa tiempo infinito: el observador pasivo pierde en la semana 21. |
| Firma de `avanzarSemana` | La guía v2.0 §6 la plantea como `avanzarSemana(estado): GameState` desde `src/core/simulation` | `avanzarSemana(estado): ResultadoComando` en `src/engine/motor.ts` | Todos los comandos comparten firma y devuelven `{estado, ok, mensaje}`. Cambiarla rompería la frontera única del motor y las 82 pruebas. La prueba de balance usa un helper que desenvuelve el resultado; las aserciones son las de la guía. |
| Costo de acciones tempranas | La guía v2.0 §5.B propone acciones de costo fijo (20 hrs ⇒ +10% Apoyo) | Se conserva el modelo continuo con saturación (20 hrs ⇒ ≈ +5.9% con Apoyo en 30) | El modelo continuo es el que sostiene la matriz de arquetipos validada en la Entrada #011. Lo que sí se calibró al número exacto de la guía son las **firmas**, que son la meta real de la Etapa A. |
| Nombre de la abogada | El GDD §10 dice **Sofía**; la Bitácora #012 dice **Mariana** | **Mariana Rendón** | La Entrada #012 es posterior y es la que rige el contenido de la v2.0. |

---

## 6. Simulación headless y balanceo

`src/sim/` contiene el runner y cuatro políticas de juego automático. No son solo
pruebas: son el **instrumento de balanceo** del proyecto.

```bash
npm run sim              # traza semanal completa del estratega colectivo
npm run sim:matriz       # comparativa de los cuatro arquetipos
npm run sim -- --semilla=777 --cada=2 --politica="Líder mártir"
```

Resultado con la semilla por defecto (20260906):

| Política | Desenlace | Semana | Apoyo | Resistencia |
| :--- | :--- | ---: | ---: | ---: |
| Estratega colectivo | `VICTORIA_DOF` | 88 | 44% | 46% |
| Pragmático | `VICTORIA_DOF` (mutilada) | 86 | 44% | 44% |
| Líder mártir | `DERROTA_BURNOUT` | 5 | 35% | 0% |
| Observador pasivo | `DERROTA_CONGELADORA` | 21 | 30% | 90% |

Que los cuatro arquetipos produzcan cuatro desenlaces distintos y coherentes con la
tesis pedagógica es el criterio de "balanceo correcto" del proyecto.

**Al tocar `balance.ts`, corre siempre `npm run test && npm run sim:matriz`.** Si un
arquetipo cambia de desenlace, la lección pedagógica cambió con él.

---

## 7. Cobertura del plan de pruebas de la GUÍA

| Prueba de la GUÍA §6 | Archivo | Estado |
| :--- | :--- | :--- |
| 1 · Simulación headless de 100 semanas, cambios de fase en 31 y 66 | [`ciclo-semanal.test.ts`](../src/engine/__tests__/ciclo-semanal.test.ts) | ✅ 14 casos |
| 2 · Resiliencia en la Semana 48 (con colectivo vs. en solitario) | [`semana-48.test.ts`](../src/engine/__tests__/semana-48.test.ts) | ✅ 10 casos |
| 3 · Tensión de horas extra y detonación de la niebla mental | [`horas-extra.test.ts`](../src/engine/__tests__/horas-extra.test.ts) | ✅ 10 casos |
| 4 · Victoria / derrota y pantalla del DOF | [`desenlaces.test.ts`](../src/engine/__tests__/desenlaces.test.ts) | ✅ 9 casos |
| — Disparadores por umbral y dilemas | [`disparadores.test.ts`](../src/engine/__tests__/disparadores.test.ts) | ✅ 16 casos |
| — Pureza, inmutabilidad y determinismo | [`pureza.test.ts`](../src/engine/__tests__/pureza.test.ts) | ✅ 10 casos |
| v2.0 · Progresión escalonada del early game | [`balance_early_game.test.ts`](../src/engine/__tests__/balance_early_game.test.ts) | ✅ 13 casos |

**82 pruebas, sin navegador, ~8 segundos.**

---

## 8. Estrategia de assets (Bitácora #010)

Cero imágenes en el bundle. Todo es procedimental:

| Elemento | Técnica | Peso |
| :--- | :--- | ---: |
| Sellos burocráticos | CSS: `Special Elite` + doble borde (`::after`) + rotación + `mix-blend-mode: multiply` + animación de impacto | 0 KB |
| Textura de carpeta manila | `repeating-linear-gradient` (renglones) + dos `radial-gradient` (manchas) | 0 KB |
| Mapa de nodos | SVG generado en el DOM desde `rutaLegislativa`; coordenadas calculadas, sin librería de grafos | 0 KB |
| Niebla mental | `radial-gradient` de viñeta con opacidad proporcional a la Resistencia | 0 KB |
| Iconografía | `lucide-react`, tree-shaken | ~8 KB |

Bundle total: **~241 KB (74 KB gzip)**.

---

## 9. Persistencia y despliegue

* **Persistencia:** `localStorage` bajo la clave `iniciativa-ciudadana:partida:v1`.
  Toda lectura y escritura va dentro de `try/catch`: en modo privado o con
  almacenamiento bloqueado, la partida sigue viva en memoria.
* **Versionado del esquema:** la clave lleva `:v1`. Si el estado guardado no valida
  mínimamente, se descarta y se inicia una partida limpia.
* **Despliegue:** Cloudflare Workers con Static Assets, desde la raíz (`base: '/'`).
  Al no haber código de servidor, `wrangler.jsonc` describe un Worker *assets-only*:
  publica `dist/` y no declara `main`. El `not_found_handling` es
  `single-page-application` porque el juego vive en una sola ruta.
  Para GitHub Pages bajo subruta, `BASE_PATH=/LegalizalaTycoon/ npm run build` — el
  `vite.config.ts` lee esa variable de entorno y no hay que tocar código.
* **Versión de Node:** `.nvmrc` fija `22`. No es una preferencia: wrangler 4.x
  exige Node ≥ 22 y el primer intento de despliegue falló con la 20.11 que teníamos
  pinneada. La CI de GitHub lee el mismo archivo, así que build local, CI y
  despliegue corren sobre la misma versión.

---

## 10. Deuda técnica conocida

Cosas que un equipo debería atender antes de considerar esto algo más que una POC:

1. **Recesos largos entre fases.** Un jugador eficiente puede resolver la instancia
   estatal en ~10 semanas y quedarse ~20 semanas sin comisión activa. Es fiel al
   calendario legislativo real, pero como ritmo de juego es plano. La v2.0 resolvió
   el arranque con el desbloqueo escalonado (§4.3); falta aplicar la misma idea a
   los recesos estatal y federal: objetivos intermedios, litigio estratégico o
   campañas de firmas por fase.
2. **Sin pruebas de componentes React.** El motor está cubierto al detalle; la UI se
   validó manualmente en navegador. Faltaría Testing Library para los flujos de modal
   y vista dual.
3. **Event Deck corto.** Cinco cartas, una vez por partida cada una. El GDD contempla
   un catálogo mayor.
4. **Accesibilidad parcial.** Hay `role`, `aria-label` y `aria-live` en los puntos
   clave, `prefers-reduced-motion` desactiva las animaciones, los tooltips responden
   a foco y toque, y el wizard se navega con flechas y Escape. Falta una pasada
   completa de navegación por teclado y de contraste AA.
5. **Sin internacionalización.** Los textos están embebidos en español mexicano, que
   es parte del diseño; extraerlos costaría trabajo si algún día se traduce.
