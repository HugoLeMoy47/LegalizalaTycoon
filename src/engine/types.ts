/**
 * MODELO DE DATOS DEL CORE ENGINE
 * ------------------------------------------------------------------
 * Fuente normativa: `docs/GUIA_AGENTE_DEV_POC.md` seccion 2 (State Schema).
 *
 * Las interfaces `Recursos`, `Legislador`, `Comision`, `MiembroColectivo` y
 * `GameState` conservan literalmente los campos y nombres de la especificacion.
 * Los campos adicionales que la POC necesito para ser jugable estan agrupados
 * bajo el comentario `EXTENSIONES POC` y justificados en `docs/ARQUITECTURA.md`.
 *
 * Este modulo es TypeScript puro: no importa React ni toca el DOM.
 */

// ---------------------------------------------------------------------------
// Enumeraciones normativas
// ---------------------------------------------------------------------------

export type FaseJuego = 'MUNICIPAL' | 'ESTATAL' | 'FEDERAL';

export type Partido =
  | 'DEFORMACION'
  | 'TRADICION_Y_ORDEN'
  | 'FRENTE_INSTITUCIONAL'
  | 'ECOLOGISTA';

export type Postura = 'FAVOR' | 'INDECISO' | 'OPOSITOR';

export type RolColectivo = 'LIDER' | 'ABOGADA' | 'VOCERO' | 'ENLACE_BASE';

export type EstadoJuego =
  | 'JUGANDO'
  | 'DESCANSO_FORZADO_SEM_48'
  | 'VICTORIA_DOF'
  | 'DERROTA_CONGELADORA'
  | 'DERROTA_BURNOUT';

/** Los 4 verbos operativos del core loop (GDD seccion 4). */
export type VerboAccion = 'INVESTIGAR' | 'MOVILIZAR' | 'CABILDEAR' | 'AUTOCUIDADO';

/** Estado de cada nodo de la ruta parlamentaria (vista Mapa de Nodos). */
export type EstadoNodo = 'PENDIENTE' | 'ACTIVO' | 'APROBADO' | 'CONGELADO' | 'OMITIDO';

/** Sellos de tinta de la vista Expediente Fisico. */
export type SelloExpediente =
  | 'EN_COMISION'
  | 'TURNADO'
  | 'CONGELADORA'
  | 'DICTAMEN_CON_ENMIENDAS'
  | 'APROBADO'
  | 'PUBLICADO_DOF';

// ---------------------------------------------------------------------------
// Recursos
// ---------------------------------------------------------------------------

export interface Recursos {
  apoyoSocial: number; // 0 a 100 (%)
  presionPolitica: number; // 0 a 100 (%)
  resistencia: number; // 0 a 100 (%) - Salud mental del lider
  fondos: number; // Recurso blando de facilitacion ($)
  horasBaseSemana: number; // Default: 40 hrs
  horasExtraMetidas: number; // Default: 0 hrs
}

// ---------------------------------------------------------------------------
// Sistema legislativo
// ---------------------------------------------------------------------------

export interface Legislador {
  id: string;
  nombre: string;
  partido: Partido;
  postura: Postura;
  costoCabildeo: number; // Puntos de presion requeridos para convencer

  // --- EXTENSIONES POC ---
  /** Bancada satelite: su voto tambien se compra con fondos (GDD seccion 6). */
  precioVotoFondos?: number;
  /** Marca al coordinador de bancada; ancla narrativa del evento de autoria. */
  esCoordinador?: boolean;
}

export interface Comision {
  id: string;
  nombre: string;
  relojCongeladoraSemanas: number; // Ej. 12 semanas
  legisladores: Legislador[];
  votosFavorRequeridos: number;
  dictamenAprobado: boolean;
  congelada: boolean;

  // --- EXTENSIONES POC ---
  /** Fase a la que pertenece la comision. */
  fase: FaseJuego;
  /** Solidez tecnica minima para que el dictamen no sea devuelto. */
  solidezTecnicaRequerida: number;
  /** Presion politica minima para ganar la votacion del Pleno posterior. */
  presionPlenoRequerida: number;
  /** Id del nodo de la ruta legislativa que representa esta comision. */
  nodoId: string;
  /** Id del nodo de Pleno que sigue a esta comision. */
  nodoPlenoId: string;
  /** Reloj original, para dibujar la barra de progreso de la congeladora. */
  relojInicial: number;
  /** Marca la comision cuya aprobacion en Pleno desemboca en el DOF. */
  esUltimaInstancia: boolean;
}

export interface NodoRuta {
  id: string;
  etiqueta: string;
  fase: FaseJuego;
  tipo: 'MESA' | 'COMISION' | 'PLENO' | 'PROMULGACION';
  estado: EstadoNodo;
}

// ---------------------------------------------------------------------------
// Colectivo
// ---------------------------------------------------------------------------

export interface MiembroColectivo {
  id: string;
  nombre: string;
  rol: RolColectivo;
  horasAsignadas: number;
  activo: boolean;

  // --- EXTENSIONES POC ---
  /** Capacidad semanal propia del aliado (no consume resistencia del lider). */
  capacidadHoras: number;
  /** Verbo al que el aliado dedica sus horas esta semana. */
  verboAsignado: VerboAccion | null;
  /** Costo de reclutamiento en fondos. */
  costoFondos: number;
  /** Apoyo social minimo para que acepte sumarse al colectivo. */
  apoyoSocialMinimo: number;
  /** Texto de ficha para la UI. */
  especialidad: string;
}

// ---------------------------------------------------------------------------
// Eventos, decisiones y reportes
// ---------------------------------------------------------------------------

export type TipoEvento =
  | 'SISTEMA'
  | 'GACETA'
  | 'CRISIS'
  | 'LOGRO'
  | 'ADVERTENCIA'
  | 'DECISION'
  | 'DESENLACE';

export interface RegistroEvento {
  semana: number;
  tipo: TipoEvento;
  titulo: string;
  texto: string;
}

export interface OpcionDecision {
  id: string;
  etiqueta: string;
  descripcion: string;
  /** Consecuencias visibles para el jugador antes de decidir. */
  consecuencias: string[];
}

export type IdDecision = 'LEY_MUTILADA' | 'COOPTACION_LIDER' | 'CESION_AUTORIA';

export interface Decision {
  id: IdDecision;
  titulo: string;
  texto: string;
  opciones: OpcionDecision[];
  /** Datos auxiliares (por ejemplo, el id del miembro cooptado). */
  contexto?: Record<string, string>;
}

/**
 * Anuncio de un hito de progresion escalonada (Etapas B y C del early game).
 * A diferencia de `Decision`, no bloquea el turno: es un acuse informativo.
 */
export interface HitoDesbloqueo {
  id: 'COLECTIVO_ABIERTO' | 'COMISION_ABIERTA';
  titulo: string;
  texto: string;
  /** Sello institucional que acompaña al anuncio, si aplica. */
  sello?: SelloExpediente;
  /** Consecuencias mecanicas visibles para el jugador. */
  efectos: string[];
}

/** Titular de prensa satirica de la Gaceta Semanal (GUIA v2.0 seccion 4.B). */
export interface TitularGaceta {
  semana: number;
  fase: FaseJuego;
  titular: string;
  /** Cabecera ficticia del medio que "publica" la nota. */
  medio: string;
}

/** Informe de Contingencia del Colectivo en Ausencia del Lider (GDD seccion 9). */
export interface ReporteColectivo {
  semanaEmision: number;
  aliadosActivos: number;
  colectivoSostuvo: boolean;
  lineas: string[];
  impactoRelojSemanas: number;
  impactoApoyoSocial: number;
  impactoResistencia: number;
}

// ---------------------------------------------------------------------------
// Estado central
// ---------------------------------------------------------------------------

export interface ResumenTurno {
  semana: number;
  fase: FaseJuego;
  deltaApoyoSocial: number;
  deltaPresionPolitica: number;
  deltaResistencia: number;
  deltaSolidezTecnica: number;
  deltaFirmas: number;
  horasTrabajadas: number;
  horasExtra: number;
}

export interface GameState {
  // --- Campos normativos (GUIA seccion 2) ---
  semanaActual: number; // 1 a 100
  faseActual: FaseJuego;
  recursos: Recursos;
  colectivo: MiembroColectivo[];
  comisionActiva: Comision | null;
  historialEventos: string[];
  iniciativaMutilada: boolean; // Decision etica clave
  estadoJuego: EstadoJuego;
  nieblaMentalActiva: boolean; // Se activa si resistencia < 30%

  // --- CAMPOS v2.0 (GUIA_REFINAMIENTO_UX_BALANCE_POC seccion 5.C) ---
  /** Firmas ciudadanas recolectadas. Meta de la Etapa A: 500. */
  firmasRecolectadas: number;
  /** Solidez juridica de la iniciativa (verbo INVESTIGAR). 0-100. */
  solidezTecnica: number;
  /** Se abre el Cuartel del Colectivo a partir de la semana 4. */
  colectivoDesbloqueado: boolean;
  /** La iniciativa entra a comisiones a partir de la semana 6. */
  comisionDesbloqueada: boolean;
  /** Marca si el jugador ya recorrio el wizard de onboarding. */
  onboardingCompletado: boolean;

  // --- EXTENSIONES POC ---
  /** Semilla y cursor del generador determinista (simulaciones reproducibles). */
  semilla: number;
  cursorAleatorio: number;
  /** Horas del lider repartidas entre los 4 verbos esta semana. */
  asignaciones: Record<VerboAccion, number>;
  /** Comisiones aun no abordadas, en orden de embudo. */
  colaComisiones: Comision[];
  /** Comisiones ya resueltas (alimentan el expediente). */
  comisionesResueltas: Comision[];
  /** Ruta parlamentaria completa para la vista de nodos. */
  rutaLegislativa: NodoRuta[];
  /** Sellos acumulados en el expediente fisico. */
  sellos: SelloExpediente[];
  /** Bitacora estructurada; `historialEventos` es su espejo plano normativo. */
  registro: RegistroEvento[];
  /** Modal de decision bloqueante pendiente de resolucion. */
  decisionPendiente: Decision | null;
  /** Anuncio de hito de desbloqueo pendiente de acuse (no bloquea el turno). */
  hitoPendiente: HitoDesbloqueo | null;
  /** Titular de la Gaceta Semanal pendiente de mostrarse (no bloquea el turno). */
  gacetaPendiente: TitularGaceta | null;
  /** Semanas consecutivas metiendo horas extra (multiplicador de fatiga). */
  semanasConsecutivasHorasExtra: number;
  /** Reporte ejecutivo de la Semana 48 (null hasta que se emite). */
  reporteSemana48: ReporteColectivo | null;
  /** Disparadores de un solo uso ya consumidos. */
  banderas: Record<string, boolean>;
  /** Semana en la que salió la última carta del Event Deck (enfriamiento). */
  semanaUltimaCarta: number;
  /** Resumen numerico del ultimo turno resuelto (panel de diagnostico). */
  ultimoTurno: ResumenTurno | null;
}

// ---------------------------------------------------------------------------
// Entradas del jugador (comandos del motor)
// ---------------------------------------------------------------------------

export type ComandoJuego =
  | { tipo: 'ASIGNAR_HORAS'; verbo: VerboAccion; horas: number }
  | { tipo: 'ASIGNAR_HORAS_ALIADO'; miembroId: string; verbo: VerboAccion | null; horas: number }
  | { tipo: 'METER_HORAS_EXTRA' }
  | { tipo: 'QUITAR_HORAS_EXTRA' }
  | { tipo: 'RECLUTAR'; miembroId: string }
  | { tipo: 'CABILDEAR_LEGISLADOR'; legisladorId: string }
  | { tipo: 'COMPRAR_VOTO'; legisladorId: string }
  | { tipo: 'RESOLVER_DECISION'; opcionId: string }
  | { tipo: 'CERRAR_HITO' }
  | { tipo: 'CERRAR_GACETA' }
  | { tipo: 'COMPLETAR_ONBOARDING' }
  | { tipo: 'AVANZAR_SEMANA' };

export interface ResultadoComando {
  estado: GameState;
  ok: boolean;
  /** Motivo del rechazo cuando `ok` es false (la UI lo muestra como aviso). */
  mensaje?: string;
}
