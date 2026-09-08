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
  // La simulacion mide el regimen de las 100 semanas, no el prologo: arranca
  // con las bonificaciones del Nivel 0 ya transferidas, como el jugador que
  // lo resolvio por la via civica.
  let estado = crearEstadoInicial({ semilla, saltarNivel0: true });

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

const ORDEN_FASES: FaseJuego[] = ['MUNICIPAL', 'ESTATAL', 'FEDERAL'];

/**
 * Contrato del calendario de fases (v2.2).
 *
 * Las semanas 31 y 66 dejaron de ser el unico momento en que la fase cambia:
 * quien cierra su embudo antes entra al siguiente orden de gobierno al terminar
 * el receso parlamentario. Lo que sigue siendo invariante es que:
 *
 *  1. Las fases nunca retroceden.
 *  2. Ninguna fase abre DESPUES de su corte de calendario: el periodo ordinario
 *     de sesiones arranca en su fecha aunque el jugador no haya cerrado nada.
 */
export function verificarCalendarioDeFases(traza: FilaTraza[]): {
  correcto: boolean;
  incidencias: string[];
} {
  const incidencias: string[] = [];
  let maxima = 0;

  for (const fila of traza) {
    const indice = ORDEN_FASES.indexOf(fila.fase);
    if (indice < maxima) {
      incidencias.push(`Semana ${fila.semana}: la fase retrocedio a ${fila.fase}.`);
    }
    maxima = Math.max(maxima, indice);

    const minimaPorCalendario = ORDEN_FASES.indexOf(faseDeSemana(fila.semana));
    if (indice < minimaPorCalendario) {
      incidencias.push(
        `Semana ${fila.semana}: fase ${fila.fase}, el calendario ya exigia ${faseDeSemana(fila.semana)}.`,
      );
    }
  }

  return { correcto: incidencias.length === 0, incidencias };
}
