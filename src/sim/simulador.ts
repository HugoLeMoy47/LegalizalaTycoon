/**
 * Runner de simulaciones headless. Sin DOM, sin React: TypeScript puro
 * ejecutandose en Node en milisegundos.
 */

import {
  crearEstadoInicial,
  ejecutarComando,
  faseDeSemana,
  type EstadoJuego,
  type FaseJuego,
  type GameState,
} from '../engine';
import type { Politica } from './politicas';

export interface FilaTraza {
  semana: number;
  fase: FaseJuego;
  estadoJuego: EstadoJuego;
  apoyoSocial: number;
  presionPolitica: number;
  resistencia: number;
  solidezTecnica: number;
  niebla: boolean;
  relojCongeladora: number | null;
  votosFavor: number;
  aliados: number;
}

export interface ResultadoSimulacion {
  politica: string;
  semilla: number;
  estadoFinal: GameState;
  desenlace: EstadoJuego;
  semanasJugadas: number;
  traza: FilaTraza[];
  decisionesTomadas: { semana: number; decision: string; opcion: string }[];
}

export interface OpcionesSimulacion {
  semilla?: number;
  /** Corta la simulacion antes de tiempo (util en pruebas puntuales). */
  semanaLimite?: number;
}

function capturarFila(estado: GameState): FilaTraza {
  return {
    semana: estado.semanaActual,
    fase: estado.faseActual,
    estadoJuego: estado.estadoJuego,
    apoyoSocial: Math.round(estado.recursos.apoyoSocial * 10) / 10,
    presionPolitica: Math.round(estado.recursos.presionPolitica * 10) / 10,
    resistencia: Math.round(estado.recursos.resistencia * 10) / 10,
    solidezTecnica: Math.round(estado.solidezTecnica * 10) / 10,
    niebla: estado.nieblaMentalActiva,
    relojCongeladora: estado.comisionActiva?.relojCongeladoraSemanas ?? null,
    votosFavor:
      estado.comisionActiva?.legisladores.filter((l) => l.postura === 'FAVOR').length ?? 0,
    aliados: estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length,
  };
}

const EN_CURSO: EstadoJuego[] = ['JUGANDO', 'DESCANSO_FORZADO_SEM_48'];

export function simularPartida(
  politica: Politica,
  opciones: OpcionesSimulacion = {},
): ResultadoSimulacion {
  const semilla = opciones.semilla ?? 20260906;
  const limite = opciones.semanaLimite ?? 100;
  let estado = crearEstadoInicial({ semilla });

  const traza: FilaTraza[] = [capturarFila(estado)];
  const decisionesTomadas: ResultadoSimulacion['decisionesTomadas'] = [];
  let iteraciones = 0;

  const resolverPendientes = () => {
    let guarda = 0;
    while (estado.decisionPendiente && guarda < 8) {
      const decision = estado.decisionPendiente;
      const opcion = politica.decidir(estado, decision);
      decisionesTomadas.push({ semana: estado.semanaActual, decision: decision.id, opcion });
      const r = ejecutarComando(estado, { tipo: 'RESOLVER_DECISION', opcionId: opcion });
      estado = r.estado;
      guarda += 1;
    }
  };

  while (EN_CURSO.includes(estado.estadoJuego) && estado.semanaActual <= limite) {
    iteraciones += 1;
    if (iteraciones > 500) throw new Error('Simulación sin convergencia: revisa el ciclo semanal.');

    resolverPendientes();

    for (const comando of politica.planear(estado)) {
      const r = ejecutarComando(estado, comando);
      if (r.ok) estado = r.estado;
    }
    resolverPendientes();

    const avance = ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' });
    if (!avance.ok) break;
    estado = avance.estado;

    resolverPendientes();
    traza.push(capturarFila(estado));
  }

  return {
    politica: politica.nombre,
    semilla,
    estadoFinal: estado,
    desenlace: estado.estadoJuego,
    semanasJugadas: estado.semanaActual,
    traza,
    decisionesTomadas,
  };
}

/** Verifica que las fases cambien exactamente en las semanas 31 y 66. */
export function verificarCalendarioDeFases(traza: FilaTraza[]): {
  correcto: boolean;
  incidencias: string[];
} {
  const incidencias: string[] = [];
  for (const fila of traza) {
    const esperada = faseDeSemana(fila.semana);
    if (fila.fase !== esperada) {
      incidencias.push(`Semana ${fila.semana}: fase ${fila.fase}, se esperaba ${esperada}.`);
    }
  }
  return { correcto: incidencias.length === 0, incidencias };
}
