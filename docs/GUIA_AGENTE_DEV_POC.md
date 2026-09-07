# 🤖 GUÍA DE IMPLEMENTACIÓN PARA AGENTE DESARROLLADOR
## *Proof of Concept (POC) — Iniciativa Ciudadana: Mandato de Ley*
### *Documento de Transferencia Técnica y Arquitectura de Simulación (Agnóstico de Stack)*

---

## 🎯 1. OBJETIVO DEL AGENTE Y FILOSOFÍA DE DESARROLLO

Este documento está redactado específicamente para que un **Agente de IA Desarrollador (Coding Agent)** comprenda la lógica del juego, sus modelos de datos y sus reglas matemáticas, permitiéndole implementar una **Prueba de Concepto (POC) 100% jugable** sin estar atado rígidamente a un framework tecnológico específico (puede construirse en HTML5/Vanilla JS, React/TypeScript, Python/Streamlit, Godot o prototipo de consola/CLI enriquecido).

### Principio de Arquitectura Obligatorio: "Lógica Pura Desacoplada"
El motor de simulación debe estar **estrictamente desacoplado de la interfaz gráfica**:
```
┌────────────────────────────────────────────────────────┐
│             CORE SIMULATION ENGINE (Puro)              │
│  • Máquina de Estados (100 Semanas / 3 Fases)         │
│  • Economía de Recursos, Fuentes y Sumideros          │
│  • Lógica Parlamentaria, Comisiones y Congeladora      │
│  • Despachador de Eventos por Umbrales Críticos       │
└───────────────────────────┬────────────────────────────┘
                            │ (Emite eventos y estado)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                  │
│  • Tablero War Room (Expediente Dual y Nodos)          │
│  • Niebla Mental (Filtros visuales y textos intrusivos)│
│  • Modales de Decisión y Reporte Ejecutivo Sem 48      │
└────────────────────────────────────────────────────────┘
```

---

## 📦 2. MODELO DE DATOS Y ESQUEMA DEL ESTADO (STATE SCHEMA)

Cualquiera que sea el lenguaje elegido, el estado central del juego (`GameState`) debe estructurarse según el siguiente esquema tipado:

```typescript
// Tipos de recursos y fases
type FaseJuego = 'MUNICIPAL' | 'ESTATAL' | 'FEDERAL';

interface Recursos {
  apoyoSocial: number;      // 0 a 100 (%)
  presionPolitica: number;  // 0 a 100 (%)
  resistencia: number;      // 0 a 100 (%) - Salud mental del líder
  fondos: number;           // Recurso blando de facilitación ($)
  horasBaseSemana: number;  // Default: 40 hrs
  horasExtraMetidas: number;// Default: 0 hrs
}

interface Legislador {
  id: string;
  nombre: string;
  partido: 'DEFORMACION' | 'TRADICION_Y_ORDEN' | 'FRENTE_INSTITUCIONAL' | 'ECOLOGISTA';
  postura: 'FAVOR' | 'INDECISO' | 'OPOSITOR';
  costoCabildeo: number;    // Puntos de presión requeridos para convencer
}

interface Comision {
  id: string;
  nombre: string;
  relojCongeladoraSemanas: number; // Ej. 12 semanas
  legisladores: Legislador[];
  votosFavorRequeridos: number;
  dictamenAprobado: boolean;
  congelada: boolean;
}

interface MiembroColectivo {
  id: string;
  nombre: string;
  rol: 'LIDER' | 'ABOGADA' | 'VOCERO' | 'ENLACE_BASE';
  horasAsignadas: number;
  activo: boolean;
}

interface GameState {
  semanaActual: number;        // 1 a 100
  faseActual: FaseJuego;
  recursos: Recursos;
  colectivo: MiembroColectivo[];
  comisionActiva: Comision | null;
  historialEventos: string[];
  iniciativaMutilada: boolean; // Decisión ética clave
  estadoJuego: 'JUGANDO' | 'DESCANSO_FORZADO_SEM_48' | 'VICTORIA_DOF' | 'DERROTA_CONGELADORA' | 'DERROTA_BURNOUT';
  nieblaMentalActiva: boolean; // Se activa si resistencia < 30%
}
```

---

## ⚙️ 3. REGLAS MATEMÁTICAS Y ALGORITMOS DE SIMULACIÓN

El agente desarrollador debe implementar los siguientes algoritmos turno a turno:

### A) El Ciclo Semanal (`avanzarSemana()`)
1. **Consumo de Horas Extra:**  
   Si `horasExtraMetidas > 0`, restar inmediatamente a la resistencia:  
   `recursos.resistencia -= (horasExtraMetidas / 10) * 15;`
2. **Drenaje Pasivo de Resistencia por Fase:**  
   * Si Fase == 'MUNICIPAL': `recursos.resistencia -= 0.5;`
   * Si Fase == 'ESTATAL': `recursos.resistencia -= 1.5;`
   * Si Fase == 'FEDERAL': `recursos.resistencia -= 4.0;`
3. **Drenaje de Apoyo Social por Presión:**  
   Mantener la presión política desgasta las bases:  
   `recursos.apoyoSocial -= (recursos.presionPolitica * 0.05);`
4. **Actualización del Reloj de la Congeladora:**  
   Si la comisión activa no ha dictaminado:  
   `comisionActiva.relojCongeladoraSemanas -= 1;`  
   *Si llega a 0 ➔ `comisionActiva.congelada = true;` (Condición de crisis/derrota).*
5. **Chequeo de Umbral de Niebla Mental:**  
   `nieblaMentalActiva = (recursos.resistencia < 30);`
6. **Incremento de Semana:**  
   `semanaActual += 1;`

---

## 🚨 4. EVENTOS POR UMBRAL Y EL HITO DE LA SEMANA 48

El agente debe programar despachadores condicionales que se activen cuando se crucen estos umbrales:

### A) Disparador Semana 48 (Crisis Obligatoria de Burnout):
* **Condición:** `semanaActual === 48`.
* **Mecánica:**  
  * Cambiar `estadoJuego = 'DESCANSO_FORZADO_SEM_48'` durante las semanas 48, 49 y 50.
  * El líder no puede recibir horas asignadas.
  * **Evaluación del Colectivo:**
    * Si la suma de miembros reclutados activos (`ABOGADA`, `VOCERO`, `ENLACE_BASE`) ≥ 2:
      * El colectivo absorbe el trabajo: el reloj de comisiones no sufre penalización y la resistencia del líder sube +15% por semana de descanso.
    * Si el jugador no reclutó o no delegó:
      * Se pierden las 3 semanas de reloj de comisiones y `apoyoSocial` cae -25%.
  * Desplegar el **Reporte Ejecutivo de Desempeño del Colectivo** en pantalla.

### B) Disparador de Alerta del Régimen:
* **Condición:** `presionPolitica >= 80`.
* **Efecto:** Disparar evento de guerra sucia mediática: `apoyoSocial -= 15` salvo que el `VOCERO` tenga horas asignadas para contener el golpe.

### C) Disparador de la "Ley Mutilada" (Oferta de Concesión):
* **Condición:** `comisionActiva.relojCongeladoraSemanas <= 3 && !comisionActiva.dictamenAprobado`.
* **Oferta:** Las bancadas ofrecen aprobar el dictamen a cambio de mutilar la ley.
  * Opción 1 (Aceptar): `iniciativaMutilada = true; dictamenAprobado = true; apoyoSocial -= 35;`
  * Opción 2 (Rechazar): Mantener la batalla; el reloj sigue corriendo.

---

## 🎨 5. ESPECIFICACIÓN DE UI PARA LA POC (WAR ROOM)

El agente debe maquetar una interfaz táctica con los siguientes componentes mínimos:

1. **Dashboard Superior:**
   * Contador: `Semana X / 100` | `Fase: [Municipal | Estatal | Federal]`.
   * Barras de Progreso: Apoyo Social (azul), Presión Política (naranja), Resistencia (verde/rojo según nivel).
   * Contador de Horas: `Horas Disponibles: 40` + Botón pulsante: `[ + Meter Horas Extra ]`.
2. **Selector de Vista Dual (Toggle):**
   * Pestaña 1: **Expediente Físico:** Muestra una ficha estilo carpeta oficial con sellos de estado (*"EN COMISIÓN"*, *"CONGELADORA"*, *"APROBADO"*).
   * Pestaña 2: **Mapa de Nodos:** Diagrama visual simple de pasos conectados: `Mesa Directiva ➔ Comisión de Salud ➔ Comisión de Justicia ➔ Pleno`.
3. **Panel de Comisiones y Semáforo de Votos:**
   * Lista de legisladores con tarjetas de color según su partido (*Movimiento de la Deformación*, *Tradición y Orden*, etc.) y estado de voto: 🟢 A Favor, 🟡 Indeciso, 🔴 En Contra.
4. **Módulo de Niebla Mental (Efecto procedimental cuando Resistencia < 30%):**
   * Añadir clase CSS o filtro visual que oscurezca los márgenes.
   * Mostrar mensajes de distorsión cognitiva flotantes: *"No puedes descansar"*, *"Te van a madrugar"*, *"Todo depende de ti"*.

---

## 🧪 6. PLAN DE PRUEBAS Y VALIDACIÓN DEL AGENTE

Para considerar la POC exitosa, el agente desarrollador debe validar estos escenarios:

* **Prueba 1 (Modo Simulación Headless):** Ejecutar 100 semanas automáticamente mediante un script de consola para comprobar que los decaimientos matemáticos y los cambios de fase ocurren en las semanas programadas (Sem 31 y Sem 66).
* **Prueba 2 (Resiliencia en Semana 48):** Validar que un jugador con colectivo completo sobrevive a la Semana 48 sin caer a la congeladora, mientras que un jugador en solitario sufre parálisis de proyecto.
* **Prueba 3 (Tensión de Horas Extra):** Comprobar que abusar del botón de "Horas Extra" reduce rápidamente la resistencia y detona la Niebla Mental en pantalla.
* **Prueba 4 (Victoria / Derrota):** Confirmar que si se cumplen los requisitos en la semana 100 se emite la pantalla de promulgación en el Diario Oficial de la Federación.

---
*Documento preparado como guía directa para agentes de desarrollo e ingeniería de software.*
