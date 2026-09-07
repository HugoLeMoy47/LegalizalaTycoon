/** Utilidades compartidas por las pruebas del Core Engine. */

import { crearEstadoInicial, ejecutarComando, type ComandoJuego, type GameState } from '../index';

/**
 * Avanza N semanas sin asignar horas (drenajes limpios). Si aparece un dilema
 * modal elige siempre la última opción, que en los tres dilemas es la del
 * status quo (rechazar, negar, dejar ir): así la prueba mide la mecánica que
 * le interesa sin que una decisión bloquee el turno.
 */
export function avanzarSemanas(estado: GameState, semanas: number): GameState {
  let actual = estado;
  for (let i = 0; i < semanas; i += 1) {
    actual = resolverDilemasConStatusQuo(actual);
    const r = ejecutarComando(actual, { tipo: 'AVANZAR_SEMANA' });
    if (!r.ok) break;
    actual = resolverDilemasConStatusQuo(r.estado);
  }
  return actual;
}

function resolverDilemasConStatusQuo(estado: GameState): GameState {
  let actual = estado;
  let guarda = 0;
  while (actual.decisionPendiente && guarda < 5) {
    const opciones = actual.decisionPendiente.opciones;
    const r = ejecutarComando(actual, {
      tipo: 'RESOLVER_DECISION',
      opcionId: opciones[opciones.length - 1].id,
    });
    actual = r.estado;
    guarda += 1;
  }
  return actual;
}

/**
 * Avanza semanas en "modo laboratorio": el expediente nunca tiene comisión
 * activa, de modo que el reloj de la congeladora no interfiere y se pueden
 * medir los drenajes y el calendario de fases de forma aislada.
 */
export function avanzarSemanasEnLaboratorio(estado: GameState, semanas: number): GameState {
  let actual = estado;
  for (let i = 0; i < semanas; i += 1) {
    actual = { ...actual, comisionActiva: null, colaComisiones: [], decisionPendiente: null };
    const r = ejecutarComando(actual, { tipo: 'AVANZAR_SEMANA' });
    if (!r.ok) break;
    actual = r.estado;
  }
  return actual;
}

/** Ejecuta comandos en secuencia, ignorando los que el motor rechace. */
export function aplicar(estado: GameState, comandos: ComandoJuego[]): GameState {
  let actual = estado;
  for (const comando of comandos) {
    const r = ejecutarComando(actual, comando);
    if (r.ok) actual = r.estado;
  }
  return actual;
}

/**
 * Estado de laboratorio: sin comisión activa, para aislar mecánicas de
 * recursos sin que el reloj de la congeladora termine la partida.
 *
 * v2.0: se marcan los sistemas como desbloqueados porque estas pruebas miden
 * el régimen permanente del ciclo semanal, no la progresión escalonada del
 * early game (esa vive en `balance_early_game.test.ts`).
 */
export function estadoSinComision(semilla = 1234): GameState {
  const estado = crearEstadoInicial({ semilla });
  estado.comisionActiva = null;
  estado.colaComisiones = [];
  estado.colectivoDesbloqueado = true;
  estado.comisionDesbloqueada = true;
  return estado;
}

/** Marca las Etapas A y B como superadas, dejando el juego en régimen normal. */
export function conSistemasDesbloqueados(estado: GameState): GameState {
  return { ...estado, colectivoDesbloqueado: true, comisionDesbloqueada: true };
}

/** Fuerza la postura FAVOR en los legisladores necesarios para dictaminar. */
export function alinearVotos(estado: GameState): GameState {
  const copia = structuredClone(estado);
  const comision = copia.comisionActiva;
  if (!comision) return copia;
  for (let i = 0; i < comision.votosFavorRequeridos; i += 1) {
    comision.legisladores[i].postura = 'FAVOR';
  }
  return copia;
}
