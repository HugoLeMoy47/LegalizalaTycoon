# 🎮 GUÍA DE REFINAMIENTO UX, NARRATIVA Y BALANCE DE LA POC (v2.0)
## *Iniciativa Ciudadana: Mandato de Ley — Activismo Tycoon*
### *Documento de Transferencia Técnica para Implementación Inmediata*

---

## 🎯 1. RESUMEN EJECUTIVO Y OBJETIVOS DE LA ITERACIÓN

Tras el despliegue exitoso de la primera versión funcional de la POC, este documento establece las especificaciones exactas para transformar el prototipo en una **experiencia de juego inmersiva, pedagógicamente guiada y balanceada**, resolviendo cuatro fricciones detectadas en pruebas reales:

1. **Contexto e Inmersión:** Creación de un prólogo narrativo (*Incidente Incitador*) que otorgue sentido de propósito y urgencia inmediata al jugador.
2. **Onboarding Guiado (Wizard):** Introducción progresiva de la interfaz mediante un recorrido interactivo de 4 pasos con iluminación focalizada (*Spotlight*).
3. **Feedback Sensorial y Retórica de Medios:** Transiciones animadas de cambio de semana con resumen de deltas, tarjetas informativas (*Tooltips*) y un sistema de pop-ups de la **Gaceta Semanal** con titulares de sátira política.
4. **Progresión Pedagógica y Calibración de Balance:** Desbloqueo escalonado de sistemas durante el *early game* (Semanas 1 a 6) para evitar la sobrecarga cognitiva y modelar la recolección inicial de firmas ciudadanas antes de ingresar formalmente al Congreso.

---

## 📖 2. MÓDULO DE PRÓLOGO NARRATIVO: EL INCIDENTE INCITADOR

### A. Lógica de Activación
Al cargar la aplicación por primera vez (o al reiniciar partida), antes de mostrar el *War Room*, se despliega a pantalla completa un modal inmersivo con diseño de **Ficha de Incidencia Policial / Expediente Clasificado**.

### B. Especificación de Contenido y Textos del Modal

```markdown
┌────────────────────────────────────────────────────────────────────────┐
│ 📁 EXPEDIENTE POLICIAL: EXP-2026/089-CDMX                              │
│ ESTADO: CASO ACTIVO / RETENCIÓN ILEGAL                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ [ FOTOGRAFÍA CLASIFICADA CON SELLO DE "DETENIDO" ]                     │
│                                                                        │
│ 🚨 HECHOS:                                                             │
│ Anoche, elementos de la policía municipal interceptaron a Gael, un     │
│ joven estudiante de 21 años de tu comunidad, portando 6 gramos de      │
│ cannabis para uso personal.                                            │
│                                                                        │
│ Exigen una mordida de $25,000 MXN para no turnarlo al Ministerio       │
│ Público bajo cargos de narcomenudeo con prisión preventiva oficiosa.    │
│ La familia está desesperada.                                           │
│                                                                        │
│ 💡 LA EPIFANÍA:                                                        │
│ Pagar fianzas o manifestarse un fin de semana ya no es suficiente.     │
│ Mañana detendrán a alguien más. La única forma de frenar la extorsión   │
│ institucional es cambiar la ley desde su raíz.                         │
│                                                                        │
│ ⚖️ EL MANDATO Y EL RELOJ:                                              │
│ Activarás el mecanismo del ARTÍCULO 71 FRACCIÓN IV CONSTITUCIONAL:     │
│ presentar una INICIATIVA CIUDADANA para regular integralmente la causa. │
│                                                                        │
│ Cuentas con una legislatura estricta de 100 SEMANAS.                   │
│ Si no logras la promulgación en el Diario Oficial de la Federación     │
│ (DOF) antes de que termine el periodo, la iniciativa morirá en la      │
│ "Congeladora" y todo el esfuerzo será borrado.                         │
│                                                                        │
│ ¿Cuidarás a tu gente y tu salud mental, o te devorará el sistema?      │
│                                                                        │
│                      [ ✊ ASUMIR EL MANDATO ]                           │
└────────────────────────────────────────────────────────────────────────┘
```

* **Acción del Botón `[ Asumir el Mandato ]`:**
  * Oculta el modal del prólogo con un suave desvanecimiento (*fade-out*).
  * Activa automáticamente el **Wizard de Onboarding**.

---

## 🧭 3. MÓDULO DE WIZARD / ONBOARDING GUIADO (PASO A PASO)

### A. Mecánica del Tour
* Implementar un sistema de **Spotlight / Overlay oscuro** (fondo al 70% de opacidad) que resalte exclusivamente el componente activo de la pantalla.
* En cada paso se muestra una tarjeta con botón `[ Siguiente ]` y opción superior de `[ ✕ Omitir Tutorial ]`.
* El estado del onboarding se guarda en `localStorage` (`tutorial_visto: true`) para no obligar al jugador recurrente a repetirlo.

### B. Los 4 Pasos del Wizard

#### Paso 1: La Tríada Vital (Dashboard Superior)
* **Elemento iluminado:** Barras de Apoyo Social, Presión Política y Resistencia.
* **Título:** *"Tus Tres Signos Vitales"*
* **Texto explicativo:**  
  * **Apoyo Social (Azul):** Tu legitimidad comunitaria y gente en las calles.
  * **Presión Política (Naranja):** Tu capacidad de incidir en los pasillos del poder.
  * **Resistencia (Verde/Rojo):** Tu salud mental. **Alerta:** Si llega a 0%, colapsas por *Burnout* y el movimiento se desintegra. Si baja de 30%, sufrirás *Niebla Mental*.

#### Paso 2: El Presupuesto del Tiempo y la Autoexplotación
* **Elemento iluminado:** Contador de Horas Semanales (40 hrs) y Botón `[ + Meter Horas Extra ]`.
* **Título:** *"La Moneda del Activista"*
* **Texto explicativo:**  
  * Tienes 40 horas base a la semana para repartir entre recolección de firmas, redacción jurídica y autocuidado.
  * Puedes pulsar `[ + Meter Horas Extra ]` para conseguir más tiempo, pero **cada desvelo drena tu Resistencia de inmediato**. Cuidado con la trampa del mártir.

#### Paso 3: Expediente Burocrático y Nodos Tácticos
* **Elemento iluminado:** Selector de Pestañas (Expediente Físico vs. Mapa de Nodos).
* **Título:** *"El Laberinto Legislativo"*
* **Texto explicativo:**  
  * Aquí sigues el avance real de tu iniciativa.
  * Usa el **Expediente Físico** para revisar sellos institucionales y artículos observados, o el **Mapa de Nodos** para visualizar los cuellos de botella parlamentarios en cada comisión.

#### Paso 4: El Motor del Tiempo (Avanzar Semana)
* **Elemento iluminado:** Botón `[ Avanzar Semana ]` y Reloj de la Congeladora.
* **Título:** *"El Reloj de la Legislatura"*
* **Texto explicativo:**  
  * Cada turno equivale a **7 días de política mexicana**. 
  * Los diputados no trabajarán por ti: si descuidas los plazos de comisiones, tu iniciativa caerá a la **Congeladora** y quedará archivada.
  * Pulsa el botón cuando hayas distribuido tus horas. ¡Que comience la lucha!

---

## ⚡ 4. MÓDULO DE FEEDBACK SENSORIAL, TRANSICIONES Y GACETA

### A. Animación de Transición entre Semanas
Al pulsar `[ Avanzar Semana ]`:
1. **Bloqueo breve de interfaz (600 ms):** Evita doble clic accidental.
2. **Efecto de Sello Burocrático:** Un cartel flotante estampa en pantalla con ligera rotación aleatoria:  
   `"SEMANA [X] DE 100 — FASE [MUNICIPAL | ESTATAL | FEDERAL]"` acompañado de un sonido sordo de impacto de madera (*Thump* de 150 ms en Web Audio o audio pre-cargado).
3. **Flotación de Deltas (+/-):** Encima de cada barra de recursos emergen números en verde/rojo con animación de desvanecimiento hacia arriba:
   * Ej: `+8% Apoyo` (verde), `-3% Resistencia` (rojo), `Congeladora: -1 sem` (amarillo).

### B. Pop-Up de la Gaceta Semanal (Noticias y Sátira Política)
Aparece cada 2 semanas o al dispararse eventos por umbral. Ficha estilo **prensa matutina / recorte de periódico**:

#### Catálogo de Titulares Satíricos por Fase:

* **Fase Municipal (Semanas 1 - 30):**
  1. *"Regidores del Cabildo solicitan receso de 3 horas para desayunar barbacoa en sesión clave."*
  2. *"Policía municipal asegura medio cigarrillo artesanal en parque público y lo reporta como 'desarticulación de punto de distribución'."*
  3. *"Comerciantes locales muestran simpatía con el colectivo ciudadano tras hartazgo por cobro de piso policial."*
  4. *"El Presidente Municipal declara que 'la moral de las familias no se negocia' antes de revisar el borrador de la iniciativa."*

* **Fase Estatal (Semanas 31 - 65):**
  1. *"Diputado del Movimiento de la Deformación se queda dormido en votación de comisión; su asesor levanta la mano por él."*
  2. *"Bancada de Tradición y Orden exige estudios teológicos y de impacto familiar antes de dictaminar."*
  3. *"Granja de bots gubernamentales satura redes del colectivo con acusaciones de financiamiento extranjero."*
  4. *"Comisión de Puntos Constitucionales convoca a 'Foro de Parlamento Abierto' pero solo invita a ponentes afines al oficialismo."*

* **Fase Federal (Semanas 66 - 100):**
  1. *"Senadores del Frente Institucional negocian el dictamen en restaurante de cortes caros de Polanco."*
  2. *"El Partido Ecologista anuncia que votará a favor... si se añade un subsidio de hidroponía para sus empresas familiares."*
  3. *"Mesa Directiva de San Lázaro aplica 'chicanada parlamentaria' y congela el dictamen en el último minuto de la sesión."*
  4. *"Diario Oficial de la Federación publica fe de erratas que misteriosamente omitía el artículo de despenalización."*

### C. Tarjetas Informativas Contextuales (Tooltips)
Añadir soporte de *hover* e interacción táctil:
* **Sobre las Bancadas:**
  * *Movimiento de la Deformación:* *"Mayoría oficialista. Si la iniciativa no la propuso el líder moral, no existe."*
  * *Tradición y Orden:* *"Conservadurismo doctrinario. Todo cambio es una amenaza civilizatoria."*
  * *Frente Institucional:* *"Dinosaurios del trámite. Te congelan la ley con una sonrisa y una cita al reglamento de 1934."*
  * *Ecologista Pragmático:* *"Votos en renta. Buscan concesiones comerciales o presupuesto satélite."*
* **Sobre Conceptos Jurídicos:**
  * *Congeladora:* *"Práctica no oficial donde una comisión deja vencer los plazos de dictaminación para desechar la ley sin votar en contra."*
  * *Oficialía de Partes:* *"Ventanilla burocrática obligatoria para registrar formalmente documentos ante el Poder Legislativo."*

---

## ⚖️ 5. PROGRESIÓN PEDAGÓGICA Y BALANCE MATEMÁTICO (EARLY GAME)

### A. Justificación Jurídica e Institucional
En el marco legal mexicano (Art. 71 frac. IV), una iniciativa ciudadana no entra al Congreso el día 1. Primero requiere recolectar firmas ciudadanas de apoyo (mínimo el 0.13% de la lista nominal) y redactar el articulado técnico. 

Por tanto, el juego se estructura en **3 etapas de apertura gradual** durante la Fase Municipal:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      FASE 1: MUNICIPAL (Semanas 1 a 30)                         │
├──────────────────────────────┬──────────────────────────┬───────────────────────┤
│ ETAPA A: LA RECOLECTA        │ ETAPA B: EL COLECTIVO    │ ETAPA C: CABILDO      │
│ (Semanas 1 a 3)              │ (Semanas 4 a 5)          │ (Semanas 6 a 30)      │
│ • Solo el líder (40 hrs).    │ • Se une Abogada Pro-bono│ • Abre Comisión de    │
│ • Paneles bloqueados.        │ • Se desbloquea Cuartel. │   Gobernación.        │
│ • Meta: 500 firmas y técnica.│ • Capacidad: 60 hrs/sem. │ • Reloj: 16 semanas.  │
└──────────────────────────────┴──────────────────────────┴───────────────────────┘
```

---

### B. Especificación de las 3 Etapas Tempranas

#### 1. Etapa A: El Activista Solitario (Semanas 1 a 3)
* **Estado de la Interfaz:**
  * Panel del Colectivo: **Bloqueado** (candado gris con texto: *"Requiere base social mínima"*).
  * Panel de Comisión Legislativa: **Bloqueado** (candado gris con texto: *"Iniciativa aún no turnada a comisiones"*).
  * Reloj de la Congeladora: **Inactivo** (0 semanas consumidas).
* **Acciones Exclusivas Disponibles:**
  1. `Recolectar Firmas en la Plaza`: Cuesta 20 hrs ➔ Otorga `+10% Apoyo Social`.
  2. `Redactar Técnica Jurídica`: Cuesta 20 hrs ➔ Otorga `+10% Solidez Legal`.
  3. `Descanso y Autocuidado`: Cuesta 10 hrs ➔ Recupera `+15% Resistencia`.
* **La Trampa de las Horas Extra:**
  * Si el jugador gasta sus 40 hrs base repartidas, completa la meta en 3 semanas con fatiga mínima.
  * Si el jugador pulsa `[+ Horas Extra]` para terminar en 2 semanas, cada 10 hrs extra le cuestan **-15% de Resistencia**, llegando a la semana 3 exhausto y entendiendo en carne propia por qué no se puede ser activista solitario.

#### 2. Etapa B: El Hito del Cuartel del Colectivo (Semana 4)
* **Disparador:** `semanaActual === 4`.
* **Evento Desplegado:**
  * Modal: *"¡Nace el Colectivo Ciudadano! Las firmas recolectadas atrajeron a Mariana, Abogada Pro-bono con experiencia en litigio estratégico."*
* **Efectos de Balance:**
  * `colectivoDesbloqueado = true;`
  * Se activa el **Panel del Cuartel del Colectivo**.
  * Mariana aporta **+20 hrs/semana** exclusivas para asesoría legal y redacción.
  * Capacidad total del colectivo: **60 hrs/semana**.
  * La Resistencia del líder puede reservarse para tareas de vocería y autocuidado.

#### 3. Etapa C: Entrada al Cabildo y Comisión de Gobernación (Semana 6)
* **Disparador:** `semanaActual === 6`.
* **Evento Desplegado:**
  * Modal con sello oficial: *"¡Oficialía de Partes Valida la Iniciativa! Turnada a la Comisión de Gobernación y Reglamentos del Cabildo Municipal."*
* **Efectos de Balance:**
  * `comisionDesbloqueada = true;`
  * Se desbloquea el **Panel de la Comisión Legislativa** con los regidores/diputados.
  * Se activa el **Reloj de la Congeladora** configurado en **16 semanas**.
  * Se activan las acciones de cabildeo directo y negociación de votos.

---

### C. Actualizaciones Requeridas al Modelo de Datos (`types.ts`)

```typescript
// Agregar campos de progresión y desbloqueo
export interface GameState {
  semanaActual: number;
  faseActual: 'MUNICIPAL' | 'ESTATAL' | 'FEDERAL';
  recursos: Recursos;
  colectivo: MiembroColectivo[];
  comisionActiva: Comision | null;
  historialEventos: string[];
  iniciativaMutilada: boolean;
  estadoJuego: 'JUGANDO' | 'DESCANSO_FORZADO_SEM_48' | 'VICTORIA_DOF' | 'DERROTA_CONGELADORA' | 'DERROTA_BURNOUT';
  nieblaMentalActiva: boolean;
  
  // === NUEVOS CAMPOS v2.0 ===
  firmasRecolectadas: number;     // Meta inicial: 500
  solidezTecnica: number;         // 0 a 100
  colectivoDesbloqueado: boolean; // true a partir de Sem 4
  comisionDesbloqueada: boolean;  // true a partir de Sem 6
  onboardingCompletado: boolean;
}
```

---

### D. Actualizaciones al Algoritmo Semanal (`simulation.ts`)

```typescript
export function avanzarSemana(state: GameState): GameState {
  const next = structuredClone(state);

  // 1. Consumo por Horas Extra
  if (next.recursos.horasExtraMetidas > 0) {
    next.recursos.resistencia -= (next.recursos.horasExtraMetidas / 10) * 15;
    next.recursos.horasExtraMetidas = 0; // Reset semanal
  }

  // 2. Drenajes Pasivos
  if (next.faseActual === 'MUNICIPAL') next.recursos.resistencia -= 0.5;
  if (next.faseActual === 'ESTATAL') next.recursos.resistencia -= 1.5;
  if (next.faseActual === 'FEDERAL') next.recursos.resistencia -= 4.0;

  // Drenaje por presión política solo si la comisión está activa
  if (next.comisionDesbloqueada) {
    next.recursos.apoyoSocial -= (next.recursos.presionPolitica * 0.05);
  }

  // 3. Reloj de la Congeladora (Solo corre si la comisión está activa y desbloqueada)
  if (next.comisionDesbloqueada && next.comisionActiva && !next.comisionActiva.dictamenAprobado) {
    next.comisionActiva.relojCongeladoraSemanas -= 1;
    if (next.comisionActiva.relojCongeladoraSemanas <= 0) {
      next.comisionActiva.congelada = true;
      next.estadoJuego = 'DERROTA_CONGELADORA';
    }
  }

  // 4. Desbloqueo Escalonado por Semanas
  if (next.semanaActual === 3) {
    next.colectivoDesbloqueado = true; // Activo para semana 4
  }
  if (next.semanaActual === 5) {
    next.comisionDesbloqueada = true; // Activo para semana 6
    if (next.comisionActiva) {
      next.comisionActiva.relojCongeladoraSemanas = 16; // 16 semanas para municipal
    }
  }

  // 5. Umbral de Niebla Mental y Game Over por Burnout
  next.nieblaMentalActiva = (next.recursos.resistencia < 30);
  if (next.recursos.resistencia <= 0) {
    next.estadoJuego = 'DERROTA_BURNOUT';
  }

  // 6. Incrementar semana
  next.semanaActual += 1;

  return next;
}
```

---

## 🧪 6. SUITE DE PRUEBAS HEADLESS ACTUALIZADA (PRUEBA DE BALANCE SEMANAS 1-6)

El agente desarrollador debe ejecutar y validar esta prueba en consola antes de tocar los componentes visuales:

```typescript
// test/balance_early_game.test.ts
import { describe, it, expect } from 'vitest';
import { crearEstadoInicial, avanzarSemana } from '../src/core/simulation';

describe('Balance y Progresión Escalonada (Semanas 1 a 6)', () => {
  it('Debe iniciar con paneles de Colectivo y Comisión bloqueados', () => {
    const estado = crearEstadoInicial();
    expect(estado.semanaActual).toBe(1);
    expect(estado.colectivoDesbloqueado).toBe(false);
    expect(estado.comisionDesbloqueada).toBe(false);
  });

  it('Debe desbloquear el colectivo en la semana 4 sin alterar el reloj legislativo', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < 4; i++) {
      estado = avanzarSemana(estado);
    }
    expect(estado.semanaActual).toBe(4);
    expect(estado.colectivoDesbloqueado).toBe(true);
    expect(estado.comisionDesbloqueada).toBe(false);
    // El reloj no debe haber disminuido
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(16);
  });

  it('Debe desbloquear la comisión en la semana 6 y comenzar el reloj de congeladora', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < 6; i++) {
      estado = avanzarSemana(estado);
    }
    expect(estado.semanaActual).toBe(6);
    expect(estado.colectivoDesbloqueado).toBe(true);
    expect(estado.comisionDesbloqueada).toBe(true);

    // Avanzar a semana 7: el reloj debe haber corrido exactamente 1 turno
    estado = avanzarSemana(estado);
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(15);
  });

  it('Meter horas extra en semanas tempranas debe drenar resistencia severamente', () => {
    let estado = crearEstadoInicial();
    estado.recursos.horasExtraMetidas = 20; // +20 hrs extra
    estado = avanzarSemana(estado);
    // Consumo = (20/10)*15 = 30 + 0.5 pasivo = 30.5
    expect(estado.recursos.resistencia).toBeCloseTo(69.5, 1);
  });
});
```

---

## 📋 7. LISTA DE VERIFICACIÓN PARA EL AGENTE DE DESARROLLO

1. [ ] **Prólogo:** Montar componente modal con el incidente incitador y botón de acción.
2. [ ] **Wizard:** Implementar tour en 4 pasos con iluminación focal (*Spotlight*) y memoria en `localStorage`.
3. [ ] **Transición:** Agregar delay visual de 600 ms con sonido de sello y animación de deltas (+/-).
4. [ ] **Gaceta:** Implementar modal/tarjeta de titulares satíricos periódicos.
5. [ ] **Tooltips:** Añadir descripciones emergentes a las bancadas y términos burocráticos.
6. [ ] **Progresión Escalonada:** Bloquear paneles de Colectivo (Sem 1-3) y Comisión (Sem 1-5).
7. [ ] **Pruebas:** Correr y aprobar la suite `test/balance_early_game.test.ts`.

---
*Fin de la Guía de Refinamiento v2.0.*
