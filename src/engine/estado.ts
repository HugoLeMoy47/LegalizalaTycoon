/**
 * Construccion del estado inicial y utilidades de fase.
 */

import {
  RECURSOS_INICIALES,
  SEMANA_INICIO_ESTATAL,
  SEMANA_INICIO_FEDERAL,
  SEMANAS_DESCANSO_FORZADO,
  SOLIDEZ_TECNICA_INICIAL,
} from './balance';
import { plantillaColectivo } from './data/colectivo';
import { comisionesDeFase } from './data/comisiones';
import { rutaLegislativaInicial } from './data/ruta';
import type { FaseJuego, GameState, VerboAccion } from './types';
import { registrar } from './utilidades';

export const VERBOS: VerboAccion[] = ['INVESTIGAR', 'MOVILIZAR', 'CABILDEAR', 'AUTOCUIDADO'];

/** Fase que corresponde a una semana dada (GDD seccion 5). */
export function faseDeSemana(semana: number): FaseJuego {
  if (semana >= SEMANA_INICIO_FEDERAL) return 'FEDERAL';
  if (semana >= SEMANA_INICIO_ESTATAL) return 'ESTATAL';
  return 'MUNICIPAL';
}

/** Semana dentro del Descanso Forzado Obligatorio (48, 49, 50). */
export function esSemanaDeDescanso(semana: number): boolean {
  return (SEMANAS_DESCANSO_FORZADO as readonly number[]).includes(semana);
}

export interface OpcionesPartida {
  /** Semilla del PRNG. Fijarla hace la partida reproducible. */
  semilla?: number;
}

export function crearEstadoInicial(opciones: OpcionesPartida = {}): GameState {
  const semilla = opciones.semilla ?? 20260906;
  const comisionesMunicipales = comisionesDeFase('MUNICIPAL');
  const [primera, ...resto] = comisionesMunicipales;

  const estado: GameState = {
    semanaActual: 1,
    faseActual: 'MUNICIPAL',
    recursos: { ...RECURSOS_INICIALES },
    colectivo: plantillaColectivo(),
    comisionActiva: primera ?? null,
    historialEventos: [],
    iniciativaMutilada: false,
    estadoJuego: 'JUGANDO',
    nieblaMentalActiva: false,

    // --- v2.0: la partida arranca en la Etapa A (activista solitario) ---
    firmasRecolectadas: 0,
    solidezTecnica: SOLIDEZ_TECNICA_INICIAL,
    colectivoDesbloqueado: false,
    comisionDesbloqueada: false,
    onboardingCompletado: false,

    semilla,
    cursorAleatorio: semilla,
    asignaciones: { INVESTIGAR: 0, MOVILIZAR: 0, CABILDEAR: 0, AUTOCUIDADO: 0 },
    colaComisiones: resto,
    comisionesResueltas: [],
    rutaLegislativa: rutaLegislativaInicial(),
    sellos: [],
    registro: [],
    decisionPendiente: null,
    hitoPendiente: null,
    gacetaPendiente: null,
    semanasConsecutivasHorasExtra: 0,
    reporteSemana48: null,
    banderas: {},
    semanaUltimaCarta: -99,
    ultimoTurno: null,
    ultimoAvance: null,
  };

  // La iniciativa aún no está turnada: eso ocurre en la semana 6, cuando
  // Oficialía de Partes la valida (GUIA v2.0, Etapa C).

  registrar(
    estado,
    'SISTEMA',
    'Asumes el mandato',
    'Arranca la Etapa A: eres una sola persona con 40 horas a la semana. Antes de pisar el Cabildo necesitas juntar 500 firmas ciudadanas y un articulado que aguante revisión jurídica.',
  );

  return estado;
}

/** Cambia el estado de un nodo de la ruta legislativa. */
export function marcarNodo(
  estado: GameState,
  nodoId: string,
  nuevoEstado: GameState['rutaLegislativa'][number]['estado'],
): void {
  const nodo = estado.rutaLegislativa.find((n) => n.id === nodoId);
  if (nodo) nodo.estado = nuevoEstado;
}

/** Añade un sello al expediente fisico sin duplicarlo. */
export function sellar(estado: GameState, sello: GameState['sellos'][number]): void {
  if (!estado.sellos.includes(sello)) estado.sellos.push(sello);
}

/** Aliados (no lider) actualmente reclutados. */
export function aliadosActivos(estado: GameState): GameState['colectivo'] {
  return estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo);
}

export function miembroPorRol(
  estado: GameState,
  rol: GameState['colectivo'][number]['rol'],
): GameState['colectivo'][number] | undefined {
  return estado.colectivo.find((m) => m.rol === rol);
}

export function lider(estado: GameState): GameState['colectivo'][number] {
  const encontrado = estado.colectivo.find((m) => m.rol === 'LIDER');
  if (!encontrado) throw new Error('Estado corrupto: el colectivo no tiene líder.');
  return encontrado;
}

/** Horas disponibles del lider esta semana (base + extra - asignadas). */
export function horasDisponiblesLider(estado: GameState): number {
  const presupuesto = presupuestoHorasLider(estado);
  const asignadas = VERBOS.reduce((suma, verbo) => suma + estado.asignaciones[verbo], 0);
  return presupuesto - asignadas;
}

/** Presupuesto total de horas del lider; cero durante el descanso forzado. */
export function presupuestoHorasLider(estado: GameState): number {
  if (estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48') return 0;
  return estado.recursos.horasBaseSemana + estado.recursos.horasExtraMetidas;
}
