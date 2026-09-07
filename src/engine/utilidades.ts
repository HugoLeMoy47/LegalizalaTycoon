/**
 * Utilidades puras del motor: acotado numerico, clonado inmutable,
 * generador pseudoaleatorio determinista y helpers de bitacora.
 */

import type { GameState, RegistroEvento, TipoEvento } from './types';

/** Acota un valor al rango [min, max]. */
export function acotar(valor: number, min = 0, max = 100): number {
  if (Number.isNaN(valor)) return min;
  return Math.min(max, Math.max(min, valor));
}

/** Redondea a 2 decimales para evitar deriva de punto flotante en la bitacora. */
export function redondear(valor: number, decimales = 2): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Clon profundo del estado. El motor nunca muta su entrada: cada comando
 * devuelve un `GameState` nuevo, lo que hace triviales el time-travel y las
 * pruebas de regresion.
 */
export function clonarEstado(estado: GameState): GameState {
  return structuredClone(estado);
}

/**
 * PRNG determinista (mulberry32). Se guarda el cursor dentro del estado para
 * que una misma semilla reproduzca exactamente la misma partida, requisito de
 * la Prueba 1 headless.
 */
export function siguienteAleatorio(estado: GameState): number {
  estado.cursorAleatorio = (estado.cursorAleatorio + 0x6d2b79f5) | 0;
  let t = estado.cursorAleatorio;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Devuelve true con probabilidad `p`, consumiendo un numero del PRNG. */
export function ocurre(estado: GameState, p: number): boolean {
  return siguienteAleatorio(estado) < p;
}

/** Elige un elemento del arreglo de forma determinista. */
export function elegir<T>(estado: GameState, opciones: readonly T[]): T {
  const indice = Math.floor(siguienteAleatorio(estado) * opciones.length);
  return opciones[Math.min(indice, opciones.length - 1)];
}

/**
 * Escribe en la bitacora estructurada y mantiene sincronizado el
 * `historialEventos: string[]` que exige el esquema normativo.
 */
export function registrar(
  estado: GameState,
  tipo: TipoEvento,
  titulo: string,
  texto: string,
): RegistroEvento {
  const entrada: RegistroEvento = { semana: estado.semanaActual, tipo, titulo, texto };
  estado.registro.push(entrada);
  estado.historialEventos.push(`S${estado.semanaActual} · ${titulo}: ${texto}`);
  return entrada;
}

/** Formatea una cantidad de pesos para la UI y la bitacora. */
export function formatearPesos(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(monto);
}
