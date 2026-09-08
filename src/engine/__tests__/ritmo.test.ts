/**
 * RITMO Y VENTANAS DE REMEDIACIÓN (GUIA v2.2 sección 4 y criterio 7.2).
 *
 * El embudo estirado (parlamento abierto, comisión de presupuesto y espera del
 * orden del día) y el receso parlamentario fijo son la respuesta a las 54
 * semanas muertas que midió `sim:huecos` en la v2.1 (Bitácora #014).
 */

import { describe, expect, it } from 'vitest';

import {
  SEMANAS_ORDEN_DEL_DIA,
  SEMANAS_PARLAMENTO_ABIERTO,
  SEMANAS_RECESO_ENTRE_FASES,
  SEMANA_INICIO_ESTATAL,
  comisionesDeFase,
  crearEstadoInicial,
  ejecutarComando,
  enReceso,
  type GameState,
} from '../index';
import { ESTRATEGA_COLECTIVO } from '../../sim/politicas';
import { simularPartida } from '../../sim/simulador';

const SEMILLAS = [20260906, 777, 1, 42, 2026, 555_555];

/** Semanas de la partida en las que no hubo ninguna etapa activa. */
function semanasMuertas(traza: { semana: number; relojCongeladora: number | null }[]): number {
  return traza.filter((f) => f.semana > 6 && f.relojCongeladora === null).length;
}

describe('El embudo se estira (GUIA v2.2 sección 4.1)', () => {
  it('la fase municipal ya no es una sola comisión', () => {
    const municipales = comisionesDeFase('MUNICIPAL');
    expect(municipales.map((c) => c.tipo)).toEqual([
      'DICTAMINADORA',
      'PARLAMENTO_ABIERTO',
      'PRESUPUESTO',
    ]);
  });

  it('la fase estatal encadena dos dictaminadoras, el foro y Hacienda', () => {
    const estatales = comisionesDeFase('ESTATAL');
    expect(estatales.map((c) => c.tipo)).toEqual([
      'DICTAMINADORA',
      'DICTAMINADORA',
      'PARLAMENTO_ABIERTO',
      'PRESUPUESTO',
    ]);
  });

  it('el foro de parlamento abierto consume sus sesiones antes de cerrar', () => {
    const foro = comisionesDeFase('MUNICIPAL').find((c) => c.tipo === 'PARLAMENTO_ABIERTO')!;
    expect(foro.semanasTramite).toBe(SEMANAS_PARLAMENTO_ABIERTO.MUNICIPAL);
    expect(foro.legisladores).toHaveLength(0);
    // Su reloj cubre las sesiones programadas: no se congela por durar lo que dura.
    expect(foro.relojInicial).toBeGreaterThan(foro.semanasTramite);
  });

  it('la comisión de presupuesto se omite si la ley fue mutilada', () => {
    const hacienda = comisionesDeFase('ESTATAL').find((c) => c.tipo === 'PRESUPUESTO')!;
    expect(hacienda.seOmiteSiMutilada).toBe(true);
    expect(hacienda.semanasTramite).toBeGreaterThan(0);
  });

  it('el Pleno espera turno en el orden del día antes de votar', () => {
    for (const fase of ['MUNICIPAL', 'ESTATAL', 'FEDERAL'] as const) {
      expect(SEMANAS_ORDEN_DEL_DIA[fase]).toBeGreaterThan(0);
    }
  });
});

describe('Receso parlamentario (GUIA v2.2 sección 4.2 y 4.3)', () => {
  it('el receso dura entre 4 y 6 semanas, como fija la guía', () => {
    expect(SEMANAS_RECESO_ENTRE_FASES).toBeGreaterThanOrEqual(4);
    expect(SEMANAS_RECESO_ENTRE_FASES).toBeLessThanOrEqual(6);
  });

  it('al ganar la instancia municipal se abre un receso sin reloj', () => {
    const r = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 20260906 });
    const aviso = r.estadoFinal.registro.find((e) => e.titulo.startsWith('Se cierra el periodo'));
    expect(aviso).toBeDefined();

    // Durante el receso no hay etapa activa: el reloj de la congeladora no corre.
    const enReceso = r.traza.filter(
      (f) => f.fase === 'MUNICIPAL' && f.semana > (aviso?.semana ?? 0),
    );
    expect(enReceso.every((f) => f.relojCongeladora === null)).toBe(true);
  });

  it('el helper enReceso refleja la ventana abierta', () => {
    const estado: GameState = { ...crearEstadoInicial({ saltarNivel0: true }), recesoHasta: 20 };
    expect(enReceso({ ...estado, semanaActual: 19 })).toBe(true);
    expect(enReceso({ ...estado, semanaActual: 20 })).toBe(false);
    expect(enReceso({ ...estado, recesoHasta: null })).toBe(false);
  });

  it('quien no cierra su fase espera igual al corte de calendario', () => {
    // Sin comisiones que ganar, no hay receso que abrir: rige la semana 31.
    let estado = crearEstadoInicial({ saltarNivel0: true });
    estado = { ...estado, comisionActiva: null, colaComisiones: [] };
    for (let i = 0; i < 30; i += 1) {
      const r = ejecutarComando({ ...estado, decisionPendiente: null }, { tipo: 'AVANZAR_SEMANA' });
      estado = { ...r.estado, comisionActiva: null, colaComisiones: [] };
    }
    expect(estado.semanaActual).toBe(SEMANA_INICIO_ESTATAL);
    expect(estado.faseActual).toBe('ESTATAL');
  });
});

describe('Criterio de aceptación 7.2 — menos de 15 semanas desérticas', () => {
  it.each(SEMILLAS)('semilla %i deja menos de 15 semanas sin etapa activa', (semilla) => {
    const r = simularPartida(ESTRATEGA_COLECTIVO, { semilla });
    expect(semanasMuertas(r.traza)).toBeLessThan(15);
  });

  it('el resultado es estructural: no depende del azar del Event Deck', () => {
    const medidas = SEMILLAS.map((semilla) =>
      semanasMuertas(simularPartida(ESTRATEGA_COLECTIVO, { semilla }).traza),
    );
    const dispersión = Math.max(...medidas) - Math.min(...medidas);
    expect(dispersión).toBeLessThanOrEqual(2);
  });
});
