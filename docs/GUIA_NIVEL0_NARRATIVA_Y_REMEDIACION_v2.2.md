# 📱 GUÍA TÉCNICA v2.2: NIVEL 0 INTERACTIVO, RECESOS DE REMEDIACIÓN Y TELEMETRÍA
## *Iniciativa Ciudadana: Mandato de Ley — Activismo Tycoon*
### *Especificación para el Agente Desarrollador (Transferencia Técnica Directa)*

---

## 🎯 1. RESUMEN Y DIRECTRICES DE LA ITERACIÓN v2.2

Esta guía define las especificaciones técnicas para implementar las mejoras de diseño consensuadas tras el playtesting de la v2.0 y el análisis de ritmo de la v2.1:

1. **Nivel 0 Interactivo ("El Rescate de Gael"):** Sustituir el modal estático de texto por una experiencia jugable en formato de **Chat de Alerta Vecinal (Signal/WhatsApp)** donde el jugador resuelve la detención arbitraria de Gael sin pagar mordida, aprende las micro-mecánicas y vive la epifanía del Art. 71 fr. IV.
2. **Arco de Gael como Aliado Reclutable:** Integrar a Gael al catálogo de aliados del Colectivo como **Activista Territorial / Enlace Juvenil** desbloqueable en fases posteriores.
3. **Ventanas Fijas de Remediación (Recesos Parlamentarios):** Acotar los recesos entre fases a **4 - 6 semanas fijas**, funcionando como una red de seguridad pedagógica donde el jugador puede sanar Resistencia, reunir firmas y fondos sin la amenaza del reloj de la congeladora.
4. **Congelamiento de la Ruta Judicial para "Hard Mode":** La propuesta 3.A (Amparos SCJN) queda formalmente postergada para un modo de dificultad avanzada desbloqueable post-partida. **No se implementa en la v2.2**.
5. **Telemetría y Learning Analytics:** Registro ligero y ético de eventos de progreso y decisiones éticas para medir el impacto pedagógico.

---

## 💬 2. ESPECIFICACIÓN DEL NIVEL 0: CHAT VECINAL "EL RESCATE DE GAEL"

```
┌────────────────────────────────────────────────────────┐
│ 📱 RED VECINAL DE ALERTA: GRUPO "SEGURIDAD COMUNITARIA"│
│ Participantes: Doña Elena (Mamá de Gael), Tú, Vecinos │
├────────────────────────────────────────────────────────┤
│ 👵 Doña Elena: ¡URGENTE VECINOS! Se acaban de llevar a │
│   Gael en la patrulla MX-042 afuera del parque.        │
│                                                        │
│ 👵 Doña Elena: Le sembraron 6g de mota y dicen que si  │
│   no les damos $25,000 MXN ahorita, lo refundirán en   │
│   el penal por narcomenudeo. ¡Ayuda por favor!        │
│                                                        │
│ 🔘 [OPCIÓN 1: Documentar IPH]  [OPCIÓN 2: Movilizar]   │
└────────────────────────────────────────────────────────┘
```

### A. Flujo de Estados del Nivel 0 (`EstadoNivel0`)

El Nivel 0 ocurre antes de `semanaActual = 1` y corre como un sub-estado `PROLOGO_NIVEL_0`. Consta de **3 Micro-Pasos Tácticos**:

#### Paso 1: Documentación Jurídica (Enseña Solidez Técnica)
* **Situación:** La policía amenaza con fabricar cargos si no hay dinero inmediato.
* **Opciones Tácticas:**
  * **Opción A (Exigir IPH y Número de Patrulla):** *"Doña Elena, no suelte dinero. Pida el número de placa, patrulla y exija que lo trasladen al MP de inmediato con su IPH."*  
    *Efecto:* `solidezTecnica += 15`, `presionPolitica += 10`. Desarma la extorsión inmediata en la patrulla y fuerza el traslado legal al Ministerio Público.
  * **Opción B (Recomendar juntar la mordida):** *"Doña Elena, mejor consiga lo que pueda antes de que le hagan daño..."*  
    *Efecto:* Bloqueado pedagógicamente. El juego responde con un aviso: *"Pagar la mordida condena a Gael y fortalece la caja chica de la corrupción. Sé el defensor legal que necesita."* (Forzar a elegir la opción cívica).

#### Paso 2: Movilización Vecinal (Enseña Apoyo Social)
* **Situación:** Gael está incomunicado en las galeras del Ministerio Público. El comandante de guardia se niega a dar informes.
* **Opciones Tácticas:**
  * **Opción A (Alerta comunitaria y presencia física):** Mandar mensaje masivo: *"Vecinos, lleven cartulinas y teléfonos grabando afuera del MP. Transmitamos en vivo."*  
    *Efecto:* `apoyoSocial += 20`. Llegan 30 vecinos con cámaras encendidas al MP. La policía entra en pánico ante la visibilidad pública.
  * **Opción B (Esperar solos a la mañana siguiente):** *"Esperemos a que abran las oficinas formales mañana."*  
    *Efecto:* Diálogo de advertencia: *"La incomunicación nocturna es el momento de mayor tortura y siembra de pruebas. ¡Hay que movilizar ahora!"*

#### Paso 3: Presión Institucional (Enseña Presión Política)
* **Situación:** El Ministerio Público ve a la multitud pero busca intimidar a Doña Elena con un delito inventado.
* **Opciones Tácticas:**
  * **Opción A (Activar Visitaduría de Derechos Humanos y Redes):** Llamar a la Visitaduría de DDHH e ingresar folio de queja por detención arbitraria y posesión simple despenalizada.  
    *Efecto:* `presionPolitica += 25`. Llega el visitador de DDHH. Al no haber delito grave ni flagrancia justificada, el fiscal no tiene más remedio que liberar a Gael bajo reservas de ley.

---

### B. El Clímax y la Epifanía Orgánica
Tras el Paso 3, se despliega el mensaje de resolución en el chat:
* **Gael:** *"Ya salí, banda. Gracias a todos los que fueron al MP a hacer bola. Me querían quebrar, pero al ver a tanta gente afuera y al de Derechos Humanos no se atrevieron a pedirme un peso."*
* **Doña Elena:** *"¡Dios los bendiga! Nos ahorraron la mordida de 25 mil pesos."*
* **Gael (El Punto de Inflexión):** *"Pero el comandante me lo dijo en la oreja antes de soltarme: 'Hoy te salvaste chamaco, pero el reglamento municipal y la ley federal nos siguen dando permiso de pararte cuando queramos. Mañana te agarro otra vez'. Vecinos... si no cambiamos la ley, esto no se va a acabar nunca."*

* **Modal de Transición (Entrada a la Semana 1):**  
  Un botón táctico central:  
  **`[ ⚖️ ACTIVAR ARTÍCULO 71: INICIATIVA CIUDADANA (100 SEMANAS) ]`**  
  * Consecuencia: Pasa a `semanaActual = 1`, preservando las bonificaciones obtenidas en el prólogo (`apoyoSocial: 35%`, `solidezTecnica: 15%`, `resistencia: 90%`).

---

## 🤝 3. GAEL COMO ALIADO DEL COLECTIVO (ARCO COMPLETO)

Gael se suma al catálogo de `MiembroColectivo` en `src/engine/data/colectivo.ts`:

```typescript
export const ALIAS_GAEL: MiembroColectivo = {
  id: 'GAEL',
  nombre: 'Gael Martínez',
  rol: 'ACTIVISTA_TERRITORIAL', // O 'ENLACE_JUVENIL'
  horasAsignadas: 0,
  activo: false,
  desbloqueado: false,
  costoReclutamiento: 2500, // Fondos de caja chica simbólicos
  bonificaciones: {
    // Al asignar horas a Movilizar, rinde +25% en recolección de firmas
    firmasMultiplicador: 1.25,
    // Reduce el impacto de la Deuda de Implementación durante los recesos
    contencionDeuda: 0.35,
  },
  descripcion: 'Sobreviviente de detención arbitraria. Conecta con las juventudes y el territorio.'
};
```
* **Condición de Desbloqueo:** Se vuelve disponible para reclutar al concluir la Fase Municipal (Semana 30) o al alcanzar 500 firmas ciudadanas.

---

## ⏳ 4. VENTANAS FIJAS DE REMEDIACIÓN (4 A 6 SEMANAS)

Para resolver el defecto de las 55 semanas muertas sin dejar al jugador sin nada que hacer:

1. **El Embudo se Estira (Propuesta 3.C):**  
   * Con la inclusión de la **Consulta / Parlamento Abierto** (2-3 sem) y la **Comisión de Presupuesto / Hacienda** (4 sem), la tramitación en comisiones abarca de la semana 6 a la 24 en lo municipal, y de la 31 a la 58 en lo estatal.
2. **El Receso Parlamentario se Fija en 4 - 6 Semanas:**  
   * **Receso Municipal ➔ Estatal:** Semanas 25 a 30 (6 semanas de receso).
   * **Receso Estatal ➔ Federal:** Semanas 59 a 65 (7 semanas de receso).
3. **Reglas del Receso de Remediación:**
   * El Reloj de la Congeladora **NO corre** (Congreso en periodo de receso).
   * La Presión Política decae a ritmo pasivo estándar.
   * **Acciones recomendadas al jugador:**
     * `Autocuidado`: Restaurar Resistencia antes de la siguiente fase más difícil.
     * `Movilizar`: Amortiguar la `deudaDeImplementacion` y juntar fondos para la campaña estatal/federal.
     * `Investigar`: Mejorar la solidez técnica del siguiente proyecto de ley.

---

## 🚫 5. CONGELAMIENTO DE LA RUTA JUDICIAL (HARD MODE)

* La propuesta 3.A (Amparos SCJN / `LITIGAR`) **NO debe incluirse en el flujo principal de la POC**.
* Se mantendrá en el repositorio únicamente como documentación de diseño para la futura actualización `"Modo Realista / Activismo Experto"`.

---

## 📊 6. TELEMETRÍA Y LEARNING ANALYTICS (FUNNEL CÍVICO)

El motor o hook `useJuego` emitirá eventos estructurados anónimos en momentos clave:

```typescript
export interface EventoTelemetria {
  evento: 
    | 'NIVEL_0_COMPLETADO'
    | 'INICIATIVA_PRESENTADA_SEM_6'
    | 'APROBADO_MUNICIPAL'
    | 'CRISIS_BURNOUT_SEM_48'
    | 'LEY_MUTILADA_DECISION'
    | 'APROBADO_ESTATAL'
    | 'FIN_PARTIDA';
  semana: number;
  recursos: {
    apoyo: number;
    presion: number;
    resistencia: number;
    fondos: number;
  };
  metadata?: Record<string, any>;
  timestamp: number;
}
```

* Los eventos se pueden registrar en `console.info('[TELEMETRIA]', evento)` en desarrollo o enviarse a un worker ligero sin cookies ni PII (respetando la privacidad del jugador).

---

## 🧪 7. CRITERIOS DE ACEPTACIÓN Y PRUEBAS

1. **Prueba Nivel 0:** Un test automatizado verifica que completar los 3 pasos del chat transfiere al jugador a la Semana 1 con los recursos bonificados.
2. **Prueba de Receso Fijo:** Verificar con `npm run sim:huecos` que las semanas sin comisión activa se reducen de 55 a **menos de 15 semanas totales** en toda la partida de 100 semanas.
3. **Prueba Gael Aliado:** Comprobar que Gael aparece en el panel de reclutamiento tras la semana 30 y que sus bonificaciones de firmas aplican correctamente.

---
*Documento normativo de diseño y arquitectura para la iteración v2.2.*
