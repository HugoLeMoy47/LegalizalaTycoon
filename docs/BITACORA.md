# 📜 Bitácora y Memoria de Diseño — Legalízala Tycoon

Este documento registra la memoria histórica, acuerdos conceptuales, decisiones de diseño de juego (Design Decision Records), evolución del modelo pedagógico y ajustes de balanceo a lo largo de todo el desarrollo.

---

## 📌 Ficha Técnica del Proyecto

* **Título de Trabajo:** *Legalízala Tycoon* (Sujeto a definición en Paso 1).
* **Género:** Serious Game / Activismo Tycoon / Simulación Política y de Recursos.
* **Plataforma Objetivo:** Web / PC (accesible para talleres cívicos, universidades y juego independiente).
* **Rol del Jugador:** Activista de derechos humanos en México.
* **Objetivo Principal:** Llevar una demanda ciudadana desde un reglamento municipal hasta una reforma constitucional/federal en un ciclo estricto de **100 semanas**.
* **Pilar Metodológico:** Retórica Procedimental (Ian Bogost) aplicada al sistema político-legislativo mexicano.
* **Enfoque Pedagógico (Triple Dimensión):**
  * **Saber Saber (Conceptual):** Facultades por orden de gobierno (Art. 115, 116, 71, 72, 73 Constitucional), comisiones legislativas, tiempos parlamentarios, cuórum y dictaminación.
  * **Saber Hacer (Procedimental):** Redacción de iniciativas ciudadanas, articulación de asambleas, campañas de comunicación, litigio estratégico, recolección de firmas y cabildeo directo.
  * **Saber Ser (Actitudinal / Ético):** Ética en la negociación política (líneas rojas), prevención del desgaste emocional (*burnout*), cuidado colectivo y resiliencia comunitaria.

---

## 📅 Registro de Entradas y Decisiones de Diseño (Log)

### [2026-09-05] — Entrada #001: Configuración de Entorno y Fundamentos de Diseño
* **Autor:** Game Designer (Serious Games & Simulación Política) & Líder de Proyecto.
* **Acciones realizadas:**
  1. Creación del repositorio y árbol estructurado de carpetas (`docs/`, `assets/`, `entregables/`).
  2. Publicación del `README.md` institucional del proyecto.
  3. Inicialización de la presente `BITACORA.md` como fuente única de verdad para el historial de decisiones.
* **Acuerdos Metodológicos:**
  * **Proceso de Trabajo:** Metodología iterativa por módulos de discusión previa antes de consolidar entregables formales. El orden de diseño comprende 6 pasos:
    1. *Paso 1:* Pilares de Diseño y Propuesta de Valor.
    2. *Paso 2:* Bucle de Juego Principal (Core Loop) por Fase (Municipal, Estatal, Federal).
    3. *Paso 3:* Mecánicas del Sistema Legislativo (Comisiones, Tiempos, Cuórum, Congeladora).
    4. *Paso 4:* Economía de Recursos (Fuentes, Sumideros y Eventos reales).
    5. *Paso 5:* Dimensión "Saber Ser" (Crisis de Burnout Sem 48, Validación Conductual CBT y Autocuidado).
    6. *Paso 6:* UX/UI y Flujo de Pantallas de la Progresión Legal.
  * **Regla de Oro de Entregables:** Los documentos finales consolidados (GDD maestro y presentación de pitch) se compilarán en la carpeta `entregables/` únicamente cuando todos los sistemas hayan sido consensuados y validados conceptualmente en la conversación e iteración modular.
* **Premisas de Balanceo Aprobadas:**
  * *Fase Municipal (Semanas 1-30):* Construcción de base social; conversión lineal de Apoyo Social a Presión Política; desgaste de Resistencia leve.
  * *Fase Estatal (Semanas 31-65):* Tensión en comisiones; la presión alta desangra apoyo social; hito de crisis de *burnout* forzado en la **Semana 48** para enseñar la necesidad del descanso estratégico.
  * *Fase Federal (Semanas 66-100):* Alta fricción nacional; decaimiento agresivo de Resistencia (-4.0/sem); ciclo táctico de protestas de incidencia vs. retiros de autocuidado.

### [2026-09-05] — Entrada #002: Consenso del Paso 1 (Nombre, Tono y Dirección de Arte)
* **Decisiones Clave Acordadas:**
  1. **Nombre Oficial de Trabajo:** *Iniciativa Ciudadana: Mandato de Ley* (con descriptor secundario *Activismo Tycoon*). Aporta legitimidad formal para uso educativo y convicción temática.
  2. **Dirección de Arte y UI (POC):** Estilo **War Room / Tablero Táctico**. Interfaz limpia y funcional, compuesta por expedientes de comisiones, mapas de distritos/congresos, gacetas parlamentarias e indicadores de tensión social.
  3. **Tono Narrativo y Político:** Realismo institucional riguroso enriquecido con **pinceladas de humor negro e ironía de la política mexicana** (el folclor de los desayunos de pasillo, las mañas legislativas, la burocracia absurda), sin restar seriedad a los dilemas humanos y cívicos.
  4. **Pilares de Diseño:** Aprobados formalmente los tres ejes (Burocracia como tablero procedimental, Tensión entre bases y negociación, y El autocuidado como condición de victoria no negociable).

### [2026-09-05] — Entrada #003: Consenso del Paso 2 (Economía de Acciones y Colectividad)
* **Decisiones Clave Acordadas:**
  1. **Sistema de Acciones por Jornada con Autoexplotación (Opción B):** 
     - El jugador dispone de un presupuesto semanal de horas de trabajo.
     - Se introduce la mecánica procedural de **"Meter Horas Extra"**: el jugador puede forzar más acciones por semana para cumplir plazos parlamentarios, pero a un costo directo e inmediato de su barra de Resistencia / Salud Mental. Refleja fielmente la trampa psicológica real del activismo.
  2. **Sistema de Reclutamiento y Cooperación Colectiva:**
     - Se rompe el tropo del "héroe solitario". Para sobrevivir a las fases estatal y federal, el jugador debe reclutar y articular un **Colectivo Ciudadano** con roles especializados (ej. Abogada Pro-bono, Vocera Comunitaria, Enlace Parlamentario).
     - Delegar tareas se convierte en el mecanismo principal para absorber el drenaje masivo de resistencia y escalar el impacto político.

### [2026-09-05] — Entrada #004: Consenso del Paso 3 (Sistema Legislativo y Bancadas)
* **Decisiones Clave Acordadas:**
  1. **Mecánica del "Dictamen Mutilado" (Ley sin Dientes):**
     - Se aprueba la mecánica donde comisiones y bancadas ofrecen pactar la aprobación de la iniciativa a cambio de recortarle los mecanismos de sanción o el presupuesto.
     - Implicación lúdica y ética: crea un dilema frontal para el jugador entre la victoria cosmética a corto plazo (que desilusiona a las bases y no resuelve el problema de fondo) versus la resistencia por una reforma de fondo que arriesga caer a la congeladora.
  2. **Catálogo de Bancadas Políticas (Parodia Institucional):**
     - Se adopta la Opción A de sátira reconocible del ecosistema partidista mexicano:
       * **Movimiento de la Deformación (Guinda):** Mayoría oficialista hegemónica; discurso popular y mesiánico pero disciplina férrea de línea vertical; alérgicos a iniciativas ciudadanas que no puedan capitalizar ellos como propias.
       * **Partido Tradición y Orden (Azul):** Bloque conservador, pro-corporativo y moralista; dilata reformas progresistas exigiendo "estudios de impacto a la familia y la empresa".
       * **Frente Institucional del Poder (Tricolor):** Viejos dinosaurios del régimen; maestros absolutos de las trampas de procedimiento, la congeladora y el cabildeo de restaurantes caros.
       * **Partido Ecologista Pragmático (Verde):** Bancada satélite y mercenaria; vende sus votos al mejor postor presupuestal o a cambio de concesiones electorales.

### [2026-09-05] — Entrada #005: Consenso del Paso 4 (Economía de Recursos y Disparadores)
* **Decisiones Clave Acordadas:**
  1. **Rol de los Fondos (Economía Blanda de Facilitación):**
     - Para la POC, el dinero no provocará un estado de bancarrota estricto. Operará como un recurso de conveniencia para acelerar tiempos o adquirir ventajas específicas, manteniendo el foco cognitivo y estratégico en la tríada: **Apoyo Social - Presión Política - Resistencia**.
  2. **Disparadores de Eventos por Umbrales Críticos (Opción B):**
     - Los eventos narrativos no serán aleatorios arbitrarios por semana. Se activarán como **consecuencia procedimental directa** del estado de los recursos:
       * *Resistencia < 30%:* Detona eventos de crisis psicológica (insomnio, ataques de pánico, desgaste relacional).
       * *Presión Política > 80%:* Despierta la alerta del aparato estatal (campañas de desprestigio en prensa afín, ataques de granjas de bots, auditorías sorpresa).
       * *Apoyo Social < 25%:* Detona fisuras internas en el movimiento (desconfianza comunitaria, asambleas ríspidas, conatos de división).

### [2026-09-05] — Entrada #006: Consenso del Paso 5 (Dimensión Saber Ser y Crisis Sem 48)
* **Decisiones Clave Acordadas:**
  1. **Feedback Visual del Burnout (Niebla Mental / Túnel de Fatiga - Opción A):**
     - Cuando la Resistencia cae por debajo del 30%, la interfaz del War Room sufre alteraciones procedimentales:
       * Aparición de pensamientos intrusivos y catastróficos en los márgenes de la pantalla (*"si paras te van a olvidar"*, *"nadie más puede hacerlo"*).
       * Las estimaciones de éxito de las acciones se distorsionan con sesgo pesimista.
       * Las opciones de cabildeo reflejan irritabilidad emocional del activista, aumentando el riesgo de fricciones innecesarias.
  2. **Tratamiento del Hito de la Semana 48 (Reporte de Contingencia - Opción B):**
     - Durante el "Descanso Forzado Obligatorio" (Sem 48-50), el juego no recurre al melodrama, sino a la sobriedad del War Room:
       * Se despliega un **"Reporte Ejecutivo de Desempeño del Colectivo en Ausencia del Líder"**.
       * Si el jugador fomentó un liderazgo distribuido, el reporte muestra cómo el equipo cubrió comisiones y contuvo la iniciativa.
       * Si el jugador centralizó el trabajo, el reporte revela la parálisis operativa y la caída drástica del reloj legislativo, consolidando la lección pedagógica sobre el valor de la cooperación y la insostenibilidad del líder mártir.

### [2026-09-05] — Entrada #007: Consenso del Paso 6 (UI, Causa POC y Visualización Dual)
* **Decisiones Clave Acordadas:**
  1. **Causa Emblemática para la POC (Opción A):**
     - Se define como eje temático la **Regulación Integral del Cannabis en México**. 
     - Justificación de diseño: Es el ejemplo paradigmático de la lucha legislativa mexicana en los 3 niveles: desde la descriminalización de portación y espacios de consumo tolerado en municipios, pasando por leyes estatales de salud, hasta las trabas de San Lázaro, el Senado y los fallos de la Suprema Corte. Permite que todas las mecánicas y cartas de evento cobren vida con casos documentados reales.
  2. **Sistema de Progresión Dual Intercambiable (Toggle View):**
     - La UI del War Room permitirá alternar entre dos vistas de progresión legislativa mediante una pestaña:
       * **Vista A (Expediente Burocrático Físico):** Carpeta formal con sellos de tinta institucionales (*Turnado a Comisión*, *Dictamen con Enmiendas*, *Congeladora*, *Publicado en DOF*). Aporta inmersión táctil y peso administrativo.
       * **Vista B (Mapa de Nodos y Ruta Táctica):** Diagrama de flujo digital y vectorial interactivo que ilustra los cuellos de botella parlamentarios, ideal para planificar la estrategia a mediano plazo.

### [2026-09-05] — Entrada #008: Luz Verde y Definición del Paquete de Entregables
* **Hito de Proyecto:** Conclusión exitosa de la fase de consulta y diseño modular preliminar (Pasos 1 al 6).
* **Entregables Aprobados para Producción:**
  1. **Documento Maestro:** *Game Design Document (GDD) Completo* en [`entregables/gdd_final/GDD_Iniciativa_Ciudadana.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/gdd_final/GDD_Iniciativa_Ciudadana.md).
  2. **Presentación Ejecutiva / Pitch Deck:** En [`entregables/presentaciones/PITCH_DECK_Iniciativa_Ciudadana.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/presentaciones/PITCH_DECK_Iniciativa_Ciudadana.md).
  3. **Guía Técnica de Implementación para Agente Desarrollador (POC Agnostic):** En [`entregables/GUIA_AGENTE_DEV_POC.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/GUIA_AGENTE_DEV_POC.md).

### [2026-09-05] — Entrada #009: Publicación Exitosa de Entregables Maestros
* **Estado:** Entregables finalizados y verificados en el repositorio.
* **Resumen de Documentos Publicados:**
  1. [`GDD_Iniciativa_Ciudadana.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/gdd_final/GDD_Iniciativa_Ciudadana.md): Game Design Document maestro v1.0 (13 secciones completas con modelos matemáticos, sistema legislativo, bancadas satíricas con el *Movimiento de la Deformación*, economía de recursos, pedagogía CBT y catálogo de eventos).
  2. [`PITCH_DECK_Iniciativa_Ciudadana.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/presentaciones/PITCH_DECK_Iniciativa_Ciudadana.md): Presentación ejecutiva de 10 diapositivas estructurada para levantamiento de fondos cívicos, concursos de Serious Games y alianzas académicas.
  3. [`GUIA_AGENTE_DEV_POC.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/GUIA_AGENTE_DEV_POC.md): Especificación técnica desacoplada (máquina de estados, interfaces tipadas, algoritmos de drenaje, disparadores y plan de pruebas) para que un agente de desarrollo implemente la POC sin fricción ni ataduras de stack.

### [2026-09-05] — Entrada #010: Arquitectura Tecnológica, Estrategia de Assets y Despliegue de la POC Web
* **Contexto:** Evaluación técnica de la [`GUIA_AGENTE_DEV_POC.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/GUIA_AGENTE_DEV_POC.md) previa a la fase de construcción de código.
* **Decisiones de Arquitectura y Stack Tecnológico:**
  1. **Stack de Desarrollo:** **Vite + TypeScript + React + Tailwind CSS**.
     - *Justificación Técnica:* Cumple al 100% con el principio de *Lógica Pura Desacoplada*. El motor de simulación (`Core Engine`) se escribe en TypeScript puro agnóstico del DOM, permitiendo pruebas headless instantáneas en milisegundos. React y Tailwind resuelven de forma óptima la reactividad del War Room (pestañas de vista dual, semáforos de votos, barras de tensión y niebla mental).
  2. **Arquitectura de Ejecución y Costo de Infraestructura:**
     - **Ejecución 100% Client-Side:** El juego corre íntegramente en el navegador del usuario (motor de simulación en memoria, persistencia opcional con `localStorage`). No requiere servidor de backend ni bases de datos activas.
     - **Costo Operativo:** **$0.00 USD / mes**.
     - **Plataforma de Despliegue (Hosting):** GitHub Pages o Cloudflare Pages / Vercel (distribución global por CDN, HTTPS nativo y compilación automatizada vía CI/CD con GitHub Actions).
* **Estrategia de Generación de Assets y Gestión de Dependencias:**
  1. **Sellos Burocráticos y Texturas de Expediente:**
     - *Enfoque Híbrido CSS/SVG Procedimental:* En lugar de imágenes pesadas, los sellos (*"EN COMISIÓN"*, *"CONGELADORA"*, *"APROBADO"*) se generan mediante CSS con tipografía desgastada (*Special Elite* / *Courier*) y máscaras de distorsión SVG. Son ultra ligeros, escalables a cualquier resolución y admiten animación de impacto (*stamp effect*).
  2. **Iconografía Táctica:** Uso de paquetes vectoriales optimizados (*Lucide Icons*) para mantener el peso del bundle por debajo de los 100 KB.
  3. **Retratos de Personajes y Bancadas:**
     - Estilo visual unificado tipo "Ficha de Inteligencia / Carnet Confidencial": Siluetas vectoriales y elementos heráldicos de los partidos políticos satíricos (*Guinda*, *Azul*, *Tricolor*, *Verde*). Si se incorporan ilustraciones generadas por IA, se normalizan como WebP optimizados (< 30 KB) bajo una paleta cromática institucional estricta.
  4. **Mapa de Nodos:** Diagrama SVG interactivo directo en el DOM, ligero y responsivo sin librerías externas pesadas.
  5. **Niebla Mental:** Efectos CSS de sombreado de viñeta procedimental (`radial-gradient` dinámico sobre viewport) y flotación de mensajes intrusivos condicionales según nivel de Resistencia (< 30%).
* **Próximo Hito:** Implementación del Core Engine en TypeScript y suite de pruebas unitarias headless.

### [2026-09-06] — Entrada #011: Implementación de la POC Jugable y Publicación del Repositorio
* **Autor:** Agente Desarrollador (Core Engine & War Room) & Líder de Proyecto.
* **Hito de Proyecto:** Cierre del *Próximo Hito* declarado en la Entrada #010. La POC está construida, validada y lista para publicarse en GitHub.
* **Repositorio de Código:** `D:\Github\legalizalatycoon` (Vite + TypeScript + React + Tailwind CSS, conforme a la Entrada #010).

* **Etapa 1 — Core Engine Puro Desacoplado:**
  1. **Cumplimiento estricto del principio de "Lógica Pura Desacoplada":** El motor (`src/engine/`) es TypeScript agnóstico del DOM. El desacoplamiento no se declara, **se verifica**: una prueba automatizada escanea todos los módulos del motor buscando referencias a `document`, `window`, `localStorage` o `react`, y una regla de ESLint acotada al directorio refuerza la frontera.
  2. **Frontera pública inmutable:** Toda interacción pasa por `ejecutarComando(estado, comando)`, que devuelve siempre un estado nuevo y nunca muta el que recibe. Esto habilita *time-travel*, pruebas de regresión triviales y persistencia sin sorpresas.
  3. **Determinismo sembrado:** El generador pseudoaleatorio (mulberry32) vive dentro del `GameState`. Misma semilla ⇒ misma partida, bit por bit. Requisito indispensable para que la Prueba 1 headless sea reproducible y para que un reporte de error sea investigable.
  4. **Esquema normativo respetado:** Las interfaces `Recursos`, `Legislador`, `Comision`, `MiembroColectivo` y `GameState` conservan literalmente los campos de la `GUIA_AGENTE_DEV_POC.md`. Las extensiones necesarias (solidez técnica, cola de comisiones, ruta de nodos, sellos, decisiones pendientes) están agrupadas y justificadas una por una en `docs/ARQUITECTURA.md`.
  5. **Suite de validación:** 69 pruebas en Vitest, ejecución completa en ~8 segundos sin navegador. Cubren las cuatro pruebas del plan de validación de la guía (100 semanas headless, resiliencia en Semana 48, tensión de horas extra, victoria/derrota) más disparadores por umbral, inmutabilidad, determinismo y desacoplamiento.

* **Etapa 2 — Interfaz Táctica War Room:**
  1. **Vista Dual Intercambiable operativa:** Pestaña A, expediente burocrático físico sobre cartulina manila con sellos de tinta; Pestaña B, mapa de nodos SVG con la ruta parlamentaria completa de los tres órdenes de gobierno y sus cuellos de botella.
  2. **Assets 100% procedimentales (confirma la estrategia de la Entrada #010):** Cero imágenes en el bundle. Los sellos son CSS (*Special Elite* + doble borde + rotación + `mix-blend-mode`), la textura de carpeta son gradientes, el mapa es SVG generado desde el estado y la niebla es un `radial-gradient` dinámico. Bundle final: **241 KB (74 KB gzip)**.
  3. **Niebla Mental con las tres capas acordadas en la Entrada #006:** viñeteado proporcional a la Resistencia, pensamientos intrusivos flotantes —cada uno etiquetado con la distorsión cognitiva que representa, como herramienta de TCC— y **sesgo pesimista aplicado a las estimaciones en pantalla**: el motor sigue calculando bien; quien ya no lee bien es el jugador.
  4. **Semáforo parlamentario:** tarjetas de legislador con color de bancada y estado de voto 🟢🟡🔴, costo de cabildeo visible y compra de voto habilitada solo para la bancada satélite.

* **Hallazgos de Balanceo (la simulación headless hizo su trabajo):**
  Correr las 100 semanas por consola destapó tres defectos que ninguna revisión documental habría detectado:
  1. **Saturación de recursos.** Con las fórmulas literales de la guía, los tres recursos se estabilizaban al 95-100% hacia la semana 10 y la partida perdía toda tensión durante 90 semanas. *Solución:* rendimientos decrecientes por saturación (`base × (1 − recurso/100)`). Los primeros puntos de Apoyo Social salen de una asamblea; los últimos exigen convencer a quien nunca va a las asambleas.
  2. **Presión Política embotellada.** El jugador acumulaba 90% de presión durante los recesos entre fases y resolvía la instancia siguiente en cuatro semanas. *Solución:* la presión es perecedera —pierde 12% de lo acumulado por semana sin comisión activa. Sin asunto en la mesa, los pasillos te olvidan.
  3. **Ruptura interna en la semana 1.** Con Apoyo Social inicial de 25%, el primer drenaje semanal lo dejaba en 24.75% y detonaba de inmediato el evento de fisura del movimiento. *Solución:* Apoyo Social inicial de 30%.
  * **Criterio de balanceo adoptado formalmente:** la POC se considera balanceada cuando los cuatro arquetipos de jugador producen cuatro desenlaces distintos y coherentes con la tesis pedagógica. Estado actual con la semilla por defecto: *Estratega colectivo* → `VICTORIA_DOF` (semana 87); *Pragmático* → `VICTORIA_DOF` con concesiones; *Líder mártir* → `DERROTA_BURNOUT` (semana 5); *Observador pasivo* → `DERROTA_CONGELADORA` (semana 24). **Todo ajuste futuro de `balance.ts` debe acompañarse de la salida de `npm run sim:matriz`.**

* **Decisiones de Publicación en GitHub:**
  1. **Licenciamiento Dual:** **MIT** para el código fuente (`src/`, configuración, CI) y **CC BY-NC-SA 4.0** para el contenido de diseño y narrativa (`docs/`, textos de juego, GDD, esta bitácora). Justificación: maximiza la reutilización técnica sin ceder el control del material pedagógico ni habilitar su explotación comercial. El uso en aulas y talleres sin fines de lucro queda expresamente alentado.
  2. **Plataforma de Despliegue:** **Cloudflare Pages / Vercel** desde la raíz del dominio (`base: '/'`). La compatibilidad con GitHub Pages bajo subruta se conserva vía la variable de entorno `BASE_PATH`, sin necesidad de tocar código.
  3. **Integración Continua:** GitHub Actions corre lint, verificación de tipos, las 69 pruebas, **la simulación de 100 semanas** y el build de producción en cada push y pull request. La simulación en CI significa que un cambio que rompa el balanceo se detecta antes de fusionarse.
  4. **Gobernanza documental:** `CONTRIBUTING.md` fija las tres reglas del proyecto (lógica solo en el motor, cero números mágicos fuera de `balance.ts`, todo balanceo justificado con simulación) y el orden de autoridad entre documentos normativos: GUÍA > GDD > BITÁCORA. `docs/ARQUITECTURA.md` registra las desviaciones conscientes respecto de la especificación.
  5. **Plantillas de participación:** Se habilitó una plantilla de issue de **Fidelidad Institucional**, para que especialistas en el proceso legislativo mexicano puedan señalar imprecisiones del modelo con su fundamento normativo. Es la vía de contribución más valiosa para un juego educativo.
  6. **Salvaguarda de la sátira:** El `CODE_OF_CONDUCT.md` establece que la parodia de bancadas vive dentro de la obra y apunta a procedimientos e incentivos institucionales, nunca a personas, organizaciones reales o militancias, y que los espacios del repositorio no son foro de debate partidista.

* **Deuda Técnica Registrada (documentada en `docs/ARQUITECTURA.md` §10):**
  1. **Recesos largos entre fases:** un jugador eficiente puede quedarse ~20 semanas sin comisión activa. Es fiel al calendario legislativo real, pero como ritmo de juego es plano. Candidatos a resolverlo: objetivos intermedios de fase, litigio estratégico o campañas de firmas.
  2. Ausencia de pruebas de componentes React (la interfaz se validó manualmente en navegador).
  3. Event Deck corto: cinco cartas, una vez por partida cada una.
  4. Accesibilidad parcial: falta pasada completa de navegación por teclado y contraste AA.

* **Próximo Hito:** Publicación del repositorio, primer despliegue en CDN y sesión de playtesting con usuarios reales para validar el ritmo de la fase estatal y la legibilidad pedagógica del Informe de Contingencia de la Semana 48.

### [2026-09-06] — Entrada #012: Consenso y Especificación de Refinamiento v2.0 (UX, Narrativa y Early Game)
* **Contexto:** Evaluación post-despliegue de la POC en línea y retroalimentación de la primera experiencia de juego por el Líder de Proyecto. Se identificó la necesidad de atenuar la sobrecarga inicial, dar sentido emocional a la causa y guiar la curva de aprendizaje.
* **Decisiones Clave de Diseño y Refinamiento v2.0:**
  1. **Prólogo Narrativo (Incidente Incitador):**
     - Se aprueba el caso del joven Gael (detención arbitraria por 6 gramos de cannabis y extorsión policial) como catalizador de la epifanía del activista: superar la protesta reactiva y activar el **Artículo 71 Fracción IV Constitucional** (Iniciativa Ciudadana con límite estricto de 100 semanas).
     - Formato: Modal de "Expediente Confidencial de Caso" previo al ingreso al War Room.
  2. **Wizard / Onboarding Guiado (Spotlight en 4 Pasos):**
     - Recorrido focalizado con oscurecimiento del entorno (70% opacidad) que introduce sucesivamente: (1) La Tríada Vital (Apoyo, Presión, Resistencia/Burnout), (2) El presupuesto de 40 hrs y la trampa de horas extra, (3) El selector dual (Expediente vs. Nodos), y (4) El reloj legislativo y el botón de avanzar semana.
     - Persistencia del estado en `localStorage` y opción de omitir para partidas recurrentes.
  3. **Feedback Sensorial y Retórica de Medios (Game Feel):**
     - Micro-animación de transición (600 ms) al avanzar semana con sonido de sello de madera (*Thump*) y visualización de deltas flotantes (+/- recursos).
     - **Gaceta Matutina:** Pop-up periódico de titulares de prensa satírica que refleja el folclor político mexicano (recesos para barbacoa, granjas de bots, diputados dormidos, chicanadas en el DOF).
     - Tooltips informativos para describir la idiosincrasia de cada bancada y conceptos parlamentarios (Congeladora, Oficialía de Partes).
  4. **Progresión Pedagógica y Balance del Early Game (Semanas 1 a 6):**
     - Se resuelve la deuda técnica del ritmo inicial mediante un **desbloqueo escalonado** fiel a la Ley de Participación Ciudadana:
       * *Semanas 1 a 3 (Activista Solitario):* Solo el líder activo; paneles de colectivo y comisión bloqueados. Meta: juntar 500 firmas y solidez técnica. El jugador experimenta en carne propia el desgaste de autoexplotarse antes de pisar el Congreso.
       * *Semana 4 (Hito del Cuartel):* Apertura del colectivo; se suma Mariana (Abogada Pro-bono) con +20 hrs/sem. El jugador aprende a delegar.
       * *Semana 6 (Oficialía de Partes y Comisión de Gobernación):* Entrada al Cabildo; se desbloquean los diputados/regidores y arranca el Reloj de la Congeladora calibrado a 16 semanas.
* **Entregable Compilado:** Publicación formal de [`entregables/GUIA_REFINAMIENTO_UX_BALANCE_POC.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/GUIA_REFINAMIENTO_UX_BALANCE_POC.md) con la especificación técnica completa, esquemas de tipos, algoritmos actualizados y prueba de balance headless para el agente desarrollador.
* **Próximo Hito:** Implementación de las mejoras v2.0 en el código fuente de la POC y re-despliegue en producción.

### [2026-09-07] — Entrada #013: Implementación de la Versión 2.0 (UX, Narrativa y Early Game)
* **Autor:** Agente Desarrollador (Core Engine & War Room) & Líder de Proyecto.
* **Hito de Proyecto:** Cierre del *Próximo Hito* declarado en la Entrada #012. Las siete tareas de la lista de verificación de la [`GUIA_REFINAMIENTO_UX_BALANCE_POC.md`](file:///d:/hugol/OneDrive/01_MarcaPersonal/05_LegalizalaTycoon/entregables/GUIA_REFINAMIENTO_UX_BALANCE_POC.md) quedan implementadas y verificadas en navegador.
* **Contexto de Despliegue:** Previo a esta iteración se publicó el repositorio en `HugoLeMoy47/LegalizalaTycoon` y se configuró el despliegue en Cloudflare Workers con Static Assets (`wrangler.jsonc`, Node 22).

* **1. Progresión Escalonada del Early Game (Motor):**
  1. **Tres etapas implementadas conforme a la guía:** Etapa A (sem. 1-3, activista solitario con paneles bloqueados), Etapa B (sem. 4, se abre el Cuartel y Mariana se suma sola), Etapa C (sem. 6, Oficialía de Partes valida y arranca el reloj a 16 semanas).
  2. **Gating consistente del ciclo semanal:** Durante las Etapas A y B no corre el reloj de la congeladora, no se resuelven dictámenes, no se dispara ninguna carta legislativa del Event Deck y —decisión explícita de la guía— la Presión Política todavía no desgasta al Apoyo Social. Antes de la semana 6 no hay expediente en el Congreso: no hay nada de qué sospechar.
  3. **Orden de evaluación:** Los desbloqueos se aplican **después** de incrementar la semana, de modo que el reloj jamás corra en el mismo turno en que se abre la comisión. Es lo que verifica la prueba de la guía (semana 6 con reloj en 16, semana 7 con reloj en 15).
  4. **Firmas ciudadanas:** Nuevo recurso alimentado por el verbo Movilizar a 9 firmas/hora, **sin curva de saturación** (una firma es una firma). Calibrado para que 20 hrs/semana durante las tres semanas de la Etapa A den 540 firmas y rebasen la meta de 500 sin obligar a meter horas extra. Quien sí las mete llega a la semana 4 exhausto: esa es exactamente la lección que la guía pedía enseñar en carne propia.
  5. **Prueba de balance:** `balance_early_game.test.ts` con 13 casos, incluidas las cuatro aserciones textuales de la guía. Suite total: **82 pruebas en verde**.

* **2. Narrativa e Interfaz (Capa de Presentación):**
  1. **Prólogo del Incidente Incitador:** Modal de expediente policial sobre cartulina manila con sello de "DETENIDO", los cuatro bloques de texto de la guía (Hechos, Epifanía, Mandato, Reloj) y el botón *Asumir el Mandato* que encadena directo al wizard.
  2. **Wizard de Onboarding:** Cuatro pasos con *spotlight* real —hueco recortado sobre el componente iluminado mediante `box-shadow` expansivo, sin máscaras SVG ni clonado de nodos—, navegación por teclado, opción de omitir y memoria en `localStorage` bajo la clave `tutorial_visto` que la guía nombra explícitamente. Se añadió un botón permanente para repetir el tutorial.
  3. **Feedback sensorial:** Bloqueo de 600 ms, sello de semana con rotación estable por turno, deltas flotantes en verde/rojo/ámbar (incluidas las firmas y el descuento del reloj) y **golpe de madera sintetizado en Web Audio** —seno grave con caída rápida más chasquido de ruido filtrado— para no añadir un archivo de audio al bundle. Silenciable desde la barra superior.
  4. **Gaceta Semanal:** Pop-up de recorte de prensa cada dos semanas con el catálogo satírico completo de los tres niveles (barbacoa en sesión, diputado dormido, granjas de bots, cortes de Polanco, fe de erratas del DOF), atribuido a cabeceras ficticias.
  5. **Tooltips contextuales:** Bancadas y glosario parlamentario (Congeladora, Oficialía de Partes, quórum, dictamen, Pleno, firmas), accesibles con cursor, foco de teclado y toque.
  6. **Paneles bloqueados con candado:** Colectivo y Comisión muestran el candado, el motivo textual de la guía y la cuenta regresiva de semanas hasta su apertura. No se ocultan: el jugador debe ver el mapa completo del juego desde el día 1; lo que no puede es actuar sobre él todavía.

* **Hallazgo Crítico (la prueba nueva destapó un bug latente):**
  * Al aceptar el **Dictamen Mutilado**, el motor marcaba `dictamenAprobado = true` pero **no alineaba los votos ni sellaba el nodo** de la comisión. Consecuencia: el jugador superaba el Senado y la condición de victoria federal (≥65% de votos en Diputados) quedaba **imposible de cumplir para siempre**, sin ninguna acción disponible para corregirlo. Era un estado muerto sin salida, no un desbalance.
  * **Corrección:** el trato ahora incluye los votos, que es precisamente lo que las bancadas están vendiendo cuando ofrecen *"aprobamos tu ley la próxima semana"*. Narrativamente exacto y mecánicamente coherente.
  * **Efecto en la matriz:** el arquetipo *Pragmático* vuelve a ganar, y ahora lo hace **con la ley mutilada**, que es justo la lección que se le había asignado en la Entrada #011 (*"se puede ganar la foto y perder la ley"*). Antes de la corrección terminaba en congeladora, colapsando dos arquetipos en el mismo desenlace.

* **Matriz de Arquetipos tras la v2.0 (semilla 20260906):**
  | Política | Desenlace | Semana |
  | :--- | :--- | ---: |
  | Estratega colectivo | `VICTORIA_DOF` íntegra | 88 |
  | Pragmático | `VICTORIA_DOF` mutilada | 86 |
  | Líder mártir | `DERROTA_BURNOUT` | 5 |
  | Observador pasivo | `DERROTA_CONGELADORA` | 21 |
  * El criterio de balanceo de la Entrada #011 se mantiene: cuatro arquetipos, cuatro desenlaces distintos y coherentes con la tesis pedagógica.

* **Ajustes por Realidad Técnica (documentados en `docs/ARQUITECTURA.md` §5):**
  1. **Rutas y firma de funciones:** La guía plantea `src/core/simulation.ts` con `avanzarSemana(estado): GameState`. El proyecto usa `src/engine/motor.ts` con `avanzarSemana(estado): ResultadoComando`, porque todos los comandos comparten firma y devuelven estado nuevo sin mutar. La prueba usa un helper que desenvuelve el resultado; **las aserciones son las de la guía, sin cambios**.
  2. **Costo de acciones tempranas:** La guía propone acciones de costo fijo (20 hrs ⇒ +10% Apoyo). Se conservó el modelo continuo con rendimientos decrecientes, que es el que sostiene la matriz de arquetipos validada en la Entrada #011. Lo que sí se calibró al número exacto de la guía fueron las **firmas**, que son la meta real de la etapa.
  3. **Nombre de la abogada:** El GDD §10 dice *Sofía*; la Entrada #012 dice *Mariana*. Rige la entrada más reciente: **Mariana Rendón**.
  4. **Reloj municipal:** De 24 a **16 semanas**, valor que la prueba de la guía exige explícitamente.

* **Deuda Técnica Actualizada:**
  1. El desbloqueo escalonado resolvió el ritmo del **arranque**; falta aplicar la misma idea a los **recesos estatal y federal**, donde un jugador eficiente todavía puede quedarse ~20 semanas sin comisión activa.
  2. Persiste la ausencia de pruebas de componentes React (la v2.0 se validó manualmente en navegador, verificando el DOM además de las capturas).
  3. Event Deck sigue corto: cinco cartas, una vez por partida cada una.

* **Próximo Hito:** Re-despliegue en Cloudflare y sesión de playtesting con usuarios reales, ahora sí con el onboarding completo, para medir si las tres primeras semanas transmiten la lección del activista solitario sin resultar frustrantes.

### [2026-09-07] — Entrada #014: Consenso del Ritmo de Media Partida (Propuesta v2.1 — Recesos Largos)
* **Estado:** **Propuesta en revisión.** Documento de decisión de diseño previo a la implementación, conforme al proceso de la Entrada #001. No hay código escrito para estos sistemas.
* **Autor:** Agente Desarrollador & Líder de Proyecto.
* **Contexto:** Con la v2.0 desplegada, se instrumentó la deuda técnica del ritmo registrada en la Entrada #011 (§10.1 de `ARQUITECTURA.md`) mediante una herramienta nueva de diagnóstico (`npm run sim:huecos`).

#### 1. El Hallazgo: el diagnóstico anterior estaba mal planteado

La Entrada #011 registró el problema como *"recesos largos entre fases: un jugador eficiente puede quedarse ~20 semanas sin comisión activa"*. La medición sobre seis semillas distintas devuelve un cuadro peor y distinto:

| Fase | Instancia resuelta en | Semanas sin comisión activa |
| :--- | :--- | ---: |
| Municipal (6-30) | semana 7 | **24** |
| Estatal (31-65) | semana 35 | **30** |
| Federal (66-100) | semana 88 | 1 |
| **Total** | | **55 de 100** |

**Resultado idéntico en las seis semillas:** el problema es estructural, no depende del azar del Event Deck.

El enunciado correcto no es "hay recesos al final de cada fase" sino **"cada instancia se resuelve en una a cuatro semanas y el resto de la fase queda vacío"**. La Etapa C que la v2.0 acaba de construir —semanas 6 a 30— colapsa en un solo turno.

**Causas identificadas:**
1. **Embotellamiento de Presión Política.** Cabildear sigue produciendo presión durante las semanas 1-5, cuando no hay a quién cabildear. El jugador llega a la semana 6 con el tanque lleno y voltea tres regidores de golpe. Nota: la guía v2.0 §5.B solo enumera **tres** acciones para la Etapa A (firmas, técnica jurídica, autocuidado); habilitar cabildeo ahí fue una desviación de implementación, no una decisión de diseño.
2. **Comisiones calibradas contra su propio reloj, no contra la fase.** Un reloj de congeladora de 16 semanas dentro de una fase de 25 significa que resolver rápido deja 24 semanas sobrantes.

#### 2. Opciones Evaluadas

| Opción | Qué aporta | Qué enseña | Esfuerzo |
| :--- | :--- | :--- | :--- |
| **A · Ruta Judicial** | Carril paralelo con reloj y riesgo propios; absorbe el receso completo | Cuando el Congreso te cierra la puerta, existe otra | Alto |
| **B · Defensa de la Implementación** | Convierte el receso en algo que se puede perder | Victoria legislativa ≠ cambio material | Bajo-medio |
| **C · Estirar el Embudo** | Que la instancia dure lo que dura la fase | El embudo real tiene más cuellos de los que crees | Bajo |
| **D · Renovación de Legislatura** | Costo explícito al cruzar de fase | El capital político es perecedero y personal | Bajo-medio |

#### 3. Decisión: se aprueba el paquete completo (A + B + C + D)

**Justificación:** C por sí sola reduce las semanas muertas de ~55 a ~35 sin resolver el fondo; A es el único sistema capaz de absorber 25 semanas con consecuencia real; B y D dan sentido de riesgo a un tramo que hoy es puramente acumulativo. Se implementan como una iteración **v2.1** de alcance comparable a la v2.0.

---

##### 3.C — Estirar el Embudo (piso obligatorio)

1. **Cabildear se deshabilita durante la Etapa A** (semanas 1-5), alineándose con las tres acciones que enumera la guía v2.0. El jugador entra a la semana 6 con la presión cerca de cero y debe construirla con el reloj corriendo.
2. **Consulta / Parlamento Abierto** como compuerta obligatoria entre el dictamen y el Pleno: la comisión convoca foro, consume 2 a 3 semanas y exige un mínimo de Apoyo Social. Es trámite real y a la vez cuello de botella real — el propio catálogo satírico de la v2.0 ya se burla de él (*"convoca a Foro de Parlamento Abierto pero solo invita a ponentes afines"*).
3. **Comisión de Presupuesto** en las fases estatal y federal: si la ley conserva su presupuesto —es decir, **si no fue mutilada**— necesita dictamen adicional de Hacienda. Consecuencia de diseño deliberada: **mutilar la ley se vuelve mecánicamente tentador porque te ahorra una comisión entera**. El dilema ético deja de ser un modal aislado y pasa a tener peso en el calendario.
4. **Recalibración municipal:** subir `votosFavorRequeridos` del cabildo y los costos de cabildeo, para que la instancia municipal ocupe su fase.

##### 3.A — Ruta Judicial (Litigio Estratégico)

Fiel al derecho mexicano y a la historia real de la causa: la Suprema Corte forzó al Congreso precisamente porque el Congreso congelaba el asunto.

* **Recurso nuevo:** `amparosGanados` (0 a 5).
* **Verbo nuevo:** `LITIGAR`, quinto verbo del reparto de horas. La abogada pro-bono lo multiplica ×1.8.
* **Mecánica:** cada amparo acumula progreso por horas y exige un mínimo de Solidez Técnica. Al completarse, el siguiente amparo cuesta más: los tribunales se ponen exigentes. Un amparo puede perderse (probabilidad baja, determinista por semilla), costando fondos y solidez.
* **Hito de los 5 amparos — Jurisprudencia Obligatoria:** la SCJN declara la **omisión legislativa** del Congreso. Efectos: Presión Política +25 de golpe, la comisión vigente y las siguientes reducen en 1 los votos requeridos y en 10 puntos el umbral del Pleno, y el expediente recibe un sello nuevo.
* **Por qué vive en el receso sin necesidad de prohibirlo:** litigar no consume el reloj de la congeladora, y con una instancia activa las horas rinden más en cabildeo. El costo de oportunidad empuja el litigio al receso **sin bloqueos artificiales**, que es preferible a un candado.
* **Desbloqueo escalonado:** la ruta judicial se abre al ganar la primera instancia (no desde la semana 1), aplicando el mismo principio anti-sobrecarga que rige la v2.0.
* **Mapa de nodos:** columna judicial paralela con los cinco amparos y la SCJN.

##### 3.B — Defensa de la Implementación

* **Recurso nuevo:** `deudaDeImplementacion` (0 a 100).
* **Mecánica:** ganada una instancia, la ley existe en el papel y la calle no cambia sola. Cada semana de receso la deuda sube; dedicar horas a **Movilizar** la contiene. **No se añade un sexto verbo:** Movilizar pasa a significar "sostener la base y vigilar que la ley se aplique". El enlace de base la contiene con mucha mayor eficiencia, premiando el colectivo sin obligar a tenerlo.
* **Umbrales:** al cruzar 50, evento *"la ley que no se aplica"* con caída de Apoyo Social y titular de gaceta propio; al cruzar 80, fisura interna severa.
* **Epílogo:** la deuda acumulada se reporta en la pantalla final. Se puede llegar al DOF con la ley íntegra y con una deuda de implementación que la vuelve papel — una tercera vía entre la victoria limpia y la ley mutilada.

##### 3.D — Renovación de Legislatura

* **Disparador:** transición de fase (semanas 31 y 66). Modal narrativo: *"Elección intermedia: el Congreso que conociste ya no existe."*
* **Efectos:** recomposición determinista de las posturas base de la nueva comisión, corte explícito de Presión Política al cruzar de fase, y probabilidad elevada de que un aliado reciba oferta de cooptación durante la transición.

#### 4. Riesgos Asumidos y Condiciones de Aceptación

1. **Sobrecarga cognitiva.** Un quinto verbo, un carril judicial, un recurso de deuda y una elección intermedia son mucho para absorber de golpe. **Mitigación:** todo entra por desbloqueo escalonado, como la v2.0, y nada aparece antes de ganar la primera instancia.
2. **La matriz de arquetipos se romperá.** Los bots de `politicas.ts` no saben litigar ni defender la implementación, así que el *Estratega colectivo* se verá artificialmente peor. **Condición de aceptación:** la iteración no se considera terminada hasta que los cuatro arquetipos vuelvan a producir cuatro desenlaces distintos y coherentes, conforme al criterio de la Entrada #011.
3. **Medición obligatoria.** `npm run sim:huecos` debe bajar de 55 semanas muertas a **menos de 15** para dar el trabajo por bueno. Es el criterio numérico de éxito de esta entrada.
4. **La comisión de presupuesto es un incentivo perverso deliberado.** Hace más atractivo mutilar la ley. Es intencional y pedagógicamente correcto —así opera el chantaje presupuestal real—, pero exige vigilar que la victoria íntegra siga siendo alcanzable.

#### 5. Próximo Hito
Implementación de la v2.1 en el orden C → B → D → A (de menor a mayor riesgo de balance), recalibración de las políticas de simulación y validación contra los dos criterios numéricos de la sección 4.

### [2026-09-08] — Entrada #015: Consenso de Supervisión y Especificación v2.2 (Nivel 0 Gael, Remediación y Telemetría)
* **Autor:** Supervisor de Game Design, Pedagogía y Líder de Proyecto.
* **Contexto:** Evaluación de la retroalimentación de playtesting post-v2.0 y revisión crítica de la propuesta de ritmo v2.1.
* **Decisiones de Diseño Aprobadas:**
  1. **Nivel 0 Interactivo — "El Rescate de Gael" (Formato Chat de Red Vecinal / Signal):**
     - Se sustituye el modal estático de texto denso por una interfaz de mensajería ciudadana contemporánea (estilo Signal/WhatsApp grupal).
     - El jugador experimenta las mecánicas activistas a escala micro en 3 pasos: (1) Documentar abuso policial / IPH (Solidez Técnica), (2) Movilización vecinal y familiar ante el MP (Apoyo Social), y (3) Presión y alerta a Derechos Humanos (Presión Política).
     - **Resolución Ética:** Se libera a Gael sin pagar un solo peso de mordida policial.
     - **Epifanía y Transición Orgánica:** La conversación de cierre con Gael y su comunidad evidencia que la acción reactiva no frena el abuso estructural. Se activa el mandato del Art. 71 fr. IV y da inicio el reloj de las 100 semanas.
  2. **Cierre de Arco de Personaje:**
     - Gael se convierte formalmente en un aliado reclutable para el Cuartel del Colectivo en etapas posteriores bajo el rol de **Activista Territorial / Enlace Juvenil**, aportando bonificación en recolección de firmas y defensa comunitaria.
  3. **Gestión de Tiempos Muertos como "Ventanas de Remediación":**
     - Se descarta que los recesos sean un vacío desértico. Combinado con el estiramiento del embudo legislativo (Comisión de Presupuesto y Parlamento Abierto), los recesos parlamentarios se calibran en **ventanas fijas de 4 a 6 semanas**.
     - Durante el receso, el reloj de la congeladora no corre: el jugador puede descansar estratégicamente (recuperar Resistencia), juntar firmas y fondos, o amortiguar la deuda de implementación. Funciona como una red de seguridad pedagógica para jugadores en desventaja.
  4. **Postergación de la Ruta Judicial (Amparos SCJN) a "Modo Realista / Hard Mode":**
     - Para evitar sobrecarga cognitiva en la POC y no dispersar el núcleo de gestión parlamentaria, el carril judicial paralelo se reserva para un modo de dificultad avanzada desbloqueable tras completar la primera partida.
  5. **Telemetría y Analíticos de Aprendizaje (Learning Analytics):**
     - Se define el esquema de eventos anónimos de telemetría cívica para medir el embudo educativo (tasa de éxito en Nivel 0, colapsos en Sem 48, dilemas de ley mutilada y desenlace final).
* **Entregable Compilado:** [`docs/GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md`](GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md).


### [2026-09-08] — Entrada #016: Implementación de la v2.2 (Nivel 0 Interactivo, Remediación y Telemetría)
* **Estado:** **Implementada y validada.** Cierre del *Próximo Hito* declarado en la Entrada #015.
* **Autor:** Agente Desarrollador.
* **Alcance:** las cinco tareas de la [`GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md`](GUIA_NIVEL0_NARRATIVA_Y_REMEDIACION_v2.2.md). La propuesta 3.A (ruta judicial / amparos SCJN) queda formalmente congelada, conforme a la sección 5 de la guía.

#### 1. Nivel 0 Interactivo — "El Rescate de Gael"

El modal estático del prólogo se sustituye por un chat de red vecinal jugable (`ui/components/ChatNivel0.tsx`), gobernado por el sub-estado `PROLOGO_NIVEL_0` y por dos módulos puros nuevos: `engine/nivel0.ts` (lógica) y `engine/data/nivel0.ts` (guion).

Tres micro-pasos, cada uno con una salida cívica y una bloqueada:

| Paso | Enseña | Opción cívica | Opción bloqueada |
| :--- | :--- | :--- | :--- |
| 1 | Solidez Técnica | Exigir IPH y número de patrulla | Juntar la mordida |
| 2 | Apoyo Social | Alerta comunitaria y presencia física en el MP | Esperar a la mañana siguiente |
| 3 | Presión Política | Activar la Visitaduría de DDHH con folio de queja | Retirarse para no arriesgar a Doña Elena |

Las opciones no cívicas **no consumen el paso**: registran el intento en `nivel0.intentosDeMordida`, devuelven la explicación pedagógica y dejan al jugador donde estaba. Es la única decisión del juego que no se puede tomar, y es deliberado: pagar la mordida no es una estrategia alternativa, es el problema que la partida entera intenta desmontar.

#### 2. Desviación documentada: la Presión Política del prólogo no se transfiere

La guía es internamente inconsistente en este punto. La sección 2.A asigna efectos por paso (`presionPolitica += 10` y `+= 25`), mientras que la cláusula de transición de la sección 2.B fija el estado de entrada a la Semana 1 en `apoyoSocial: 35%, solidezTecnica: 15%, resistencia: 90%`, sin mencionar presión.

**Rige la cláusula de transición, y la presión vuelve a su valor de arranque (5%).** Razón: llegar a la Semana 1 con 35 puntos de Presión Política contradice frontalmente el desbloqueo escalonado de la v2.0 —cabildear no existe hasta la semana 6— y reproduce exactamente el embotellamiento que la Entrada #014 §3.C.1 identificó como causa raíz de que el cabildo se resolviera en dos turnos. La red vecinal te enseña a escalar una queja; no te deja agenda en el Congreso.

El chat sí mueve los tres recursos en vivo, para que el jugador vea la relación entre lo que decide y lo que cambia. Al activar el mandato, el estado se fija en los valores absolutos de `RECURSOS_TRAS_NIVEL_0`.

**Detectado en navegador, no en pruebas:** la primera implementación dejaba filtrar la presión y el jugador entraba a la Semana 1 con 40%. El atajo `saltarNivel0` que usan la simulación y las pruebas no ejecuta los pasos, así que la suite no lo veía. Hay ahora una prueba que exige que ambos caminos produzcan el mismo estado.

#### 3. Gael como aliado reclutable

Se suma al catálogo con el rol `ACTIVISTA_TERRITORIAL`, costo de $2,500, `firmasMultiplicador: 1.25` y desbloqueo por fase estatal **o** 500 firmas.

**Alcance no implementado, declarado:** la guía le asigna también `contencionDeuda: 0.35`, una bonificación sobre la `deudaDeImplementacion` de la propuesta 3.B de la Entrada #014. Ese sistema **no existe** y no está en el alcance de la v2.2 (la sección 1 de la guía no lo enumera). El campo no se inventó: Gael entra con lo que la v2.2 sí construye —veinte horas semanales que no salen de la Resistencia del líder y un multiplicador real de firmas—. La contención de deuda queda pendiente para cuando se implemente 3.B.

#### 4. El embudo se estira y los recesos se fijan

Dos clases de etapa nuevas, ambas con campo `tipo` en `Comision`:

* **`PARLAMENTO_ABIERTO`** — foro de consulta obligatorio entre el dictamen y el Pleno. No tiene legisladores: consume sesiones de calendario y exige sostener un mínimo de Apoyo Social. Si el respaldo cae, el foro se detiene y el reloj sigue corriendo.
* **`PRESUPUESTO`** — opinión de Hacienda, con `seOmiteSiMutilada: true`. Exige Solidez Técnica y consume sesiones.

Más una tercera espera que no es una comisión: **el orden del día del Pleno**. Tener el dictamen no es tener la votación; la Mesa Directiva enlista el asunto y el punto se cae de la sesión varias veces antes de subir a tribuna.

**El receso deja de ser un hueco y pasa a ser una ventana.** La fase siguiente abre en `min(corte del calendario, fin del embudo + 6 semanas)`. Quien cierra su instancia entra antes al siguiente orden de gobierno; quien no la cierra espera al corte fijo de siempre y paga el malus por escalar sin antecedente. Durante el receso no hay comisión activa —el reloj no corre— y la Presión Política decae al ritmo base y no al agresivo de "sin agenda", conforme a la sección 4.3 de la guía.

#### 5. Corrección de diseño: el dilema ético se había vuelto inalcanzable

Con el embudo estirado, el reloj de la congeladora casi nunca baja de las tres semanas que exigía `UMBRAL_OFERTA_MUTILACION`. Medido: el arquetipo *Pragmático* dejó de recibir la oferta y colapsó sobre el *Estratega colectivo*, con desenlace idéntico. Se rompía el criterio de balanceo de la Entrada #011.

La solución no fue bajar el umbral sino **darle al dilema el disparador que la propia v2.2 construyó**: entrar a la Comisión de Presupuesto. Ahí el chantaje es más limpio y más fiel al chantaje presupuestal real —*"bórrale la partida y no hay nada que dictaminar"*—, y hace visible el incentivo perverso que la Entrada #014 §3.C.3 diseñó a propósito.

**Efecto en la matriz:** el *Pragmático* gana **nueve semanas antes** que el *Estratega*, con la ley mutilada. Es la lectura más legible que ha tenido esa lección: mutilar la ley es mecánicamente más rápido, y ahora se puede medir cuánto.

#### 6. Telemetría y learning analytics

`engine/telemetria.ts` acumula los siete eventos del embudo cívico dentro del `GameState`. El motor **no** hace red, no toca `console` y no lee el reloj: eso rompería la pureza y el determinismo por semilla. El sumidero vive en `useJuego`, que drena la cola, estampa el `timestamp` y hoy los imprime en consola. Sin cookies, sin identificadores y sin texto libre del jugador. Cambiar de destino es cambiar ese efecto y nada más.

#### 7. Resultados contra los criterios de aceptación

| Criterio (guía §7 y Entrada #014 §4) | Meta | Resultado |
| :--- | :--- | :--- |
| Semanas desérticas (`sim:huecos`) | < 15 | **13** — idéntico en las seis semillas |
| Cuatro arquetipos, cuatro desenlaces | distintos y coherentes | **cumplido** |
| Transferencia del Nivel 0 a la Semana 1 | probada | **cumplido** (`nivel0.test.ts`) |
| Suite completa en verde | 82 → | **111 pruebas** |

Matriz de arquetipos (semilla 20260906):

| Arquetipo | Desenlace | Semana | Mutilada |
| :--- | :--- | ---: | :--- |
| Estratega colectivo | `VICTORIA_DOF` | 85 | no |
| Pragmático | `VICTORIA_DOF` | 76 | **sí** |
| Líder mártir | `DERROTA_BURNOUT` | 4 | no |
| Observador pasivo | `DERROTA_CONGELADORA` | 21 | no |

Ritmo del embudo medido con la herramienta nueva `npm run sim:ritmo`:

| Fase | Tramitación | Receso | Guía §4.1 |
| :--- | :--- | :--- | :--- |
| Municipal | 6-23 | 24-29 | 6-24 / 25-30 |
| Estatal | 30-56 | 57-62 | 31-58 / 59-65 |
| Federal | 63-87 | — | 66-100 |

Baseline de la v2.1: **54 semanas muertas**, victoria en la semana 89.

#### 8. Deuda técnica actualizada

1. La `deudaDeImplementacion` (propuesta 3.B) y la renovación de legislatura (3.D) siguen sin implementarse; la bonificación `contencionDeuda` de Gael queda declarada pero inerte.
2. La ruta judicial (3.A) queda congelada por decisión de la Entrada #015, reservada al *Hard Mode*.
3. Persiste la ausencia de pruebas de componentes React; la v2.2 se validó en navegador midiendo el DOM además de las capturas.
4. Los dos modos de juego (Iniciación de 50 semanas / Realista) siguen pendientes. El calendario recalibrado de la v2.2 cambia sus supuestos: los números propuestos antes (fases en 16 y 33, burnout en 24) habrá que rehacerlos sobre el embudo nuevo.

* **Próximo Hito:** re-despliegue en Cloudflare y sesión de playtesting sobre el ritmo nuevo, midiendo en particular si las etapas de trámite se leen como proceso o como espera.
