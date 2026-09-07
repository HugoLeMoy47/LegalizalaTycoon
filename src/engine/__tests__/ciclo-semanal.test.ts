/**
 * PRUEBA 1 DE LA GUIA — Modo Simulacion Headless.
 * Comprueba que los decaimientos matematicos y los cambios de fase ocurran
 * exactamente en las semanas programadas (31 y 66).
 */

import { describe, expect, it } from 'vitest';

import {
  DRENAJE_RESISTENCIA_POR_FASE,
  FACTOR_DRENAJE_APOYO_POR_PRESION,
  SEMANAS_TOTALES,
  UMBRAL_NIEBLA_MENTAL,
  crearEstadoInicial,
  faseDeSemana,
} from '../index';
import { ESTRATEGA_COLECTIVO, OBSERVADOR_PASIVO } from '../../sim/politicas';
import { simularPartida, verificarCalendarioDeFases } from '../../sim/simulador';
import { avanzarSemanasEnLaboratorio, estadoSinComision } from './ayudas';

describe('Ciclo semanal — estado inicial', () => {
  it('arranca en la semana 1, fase municipal y con el expediente turnado', () => {
    const estado = crearEstadoInicial();
    expect(estado.semanaActual).toBe(1);
    expect(estado.faseActual).toBe('MUNICIPAL');
    expect(estado.estadoJuego).toBe('JUGANDO');
    expect(estado.comisionActiva?.id).toBe('com-gobernacion');
    expect(estado.sellos).toContain('EN_COMISION');
    expect(estado.nieblaMentalActiva).toBe(false);
  });

  it('el líder arranca solo: ningún aliado activo', () => {
    const estado = crearEstadoInicial();
    const aliados = estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo);
    expect(aliados).toHaveLength(0);
    expect(estado.colectivo.filter((m) => m.rol === 'LIDER')).toHaveLength(1);
  });
});

describe('Ciclo semanal — drenajes pasivos (GUIA 3.A)', () => {
  it('aplica el drenaje de resistencia de la fase municipal (−0.5/sem)', () => {
    const inicial = estadoSinComision();
    const despues = avanzarSemanasEnLaboratorio(inicial, 1);
    expect(despues.recursos.resistencia).toBeCloseTo(100 - DRENAJE_RESISTENCIA_POR_FASE.MUNICIPAL, 5);
  });

  it('drena apoyo social en proporción a la presión política (×0.05)', () => {
    const inicial = estadoSinComision();
    inicial.recursos.apoyoSocial = 60;
    inicial.recursos.presionPolitica = 40;
    const presionInicial = inicial.recursos.presionPolitica;
    const despues = avanzarSemanasEnLaboratorio(inicial, 1);
    expect(despues.recursos.apoyoSocial).toBeCloseTo(
      inicial.recursos.apoyoSocial - presionInicial * FACTOR_DRENAJE_APOYO_POR_PRESION,
      5,
    );
  });

  it('acumula 10 semanas de drenaje municipal sin desviarse', () => {
    const despues = avanzarSemanasEnLaboratorio(estadoSinComision(), 10);
    expect(despues.semanaActual).toBe(11);
    expect(despues.recursos.resistencia).toBeCloseTo(
      100 - DRENAJE_RESISTENCIA_POR_FASE.MUNICIPAL * 10,
      5,
    );
  });

  it('activa la niebla mental exactamente por debajo del umbral de 30%', () => {
    const estado = estadoSinComision();
    estado.recursos.resistencia = UMBRAL_NIEBLA_MENTAL + 0.4;
    const despues = avanzarSemanasEnLaboratorio(estado, 1);
    expect(despues.recursos.resistencia).toBeLessThan(UMBRAL_NIEBLA_MENTAL);
    expect(despues.nieblaMentalActiva).toBe(true);
  });
});

describe('Ciclo semanal — calendario de fases', () => {
  it('faseDeSemana respeta los cortes normativos', () => {
    expect(faseDeSemana(1)).toBe('MUNICIPAL');
    expect(faseDeSemana(30)).toBe('MUNICIPAL');
    expect(faseDeSemana(31)).toBe('ESTATAL');
    expect(faseDeSemana(65)).toBe('ESTATAL');
    expect(faseDeSemana(66)).toBe('FEDERAL');
    expect(faseDeSemana(100)).toBe('FEDERAL');
  });

  it('cambia a ESTATAL en la semana 31 y a FEDERAL en la 66', () => {
    let estado = avanzarSemanasEnLaboratorio(estadoSinComision(), 29);
    expect(estado.semanaActual).toBe(30);
    expect(estado.faseActual).toBe('MUNICIPAL');

    estado = avanzarSemanasEnLaboratorio(estado, 1);
    expect(estado.semanaActual).toBe(31);
    expect(estado.faseActual).toBe('ESTATAL');
    expect(estado.comisionActiva?.id).toBe('com-salud');

    estado = avanzarSemanasEnLaboratorio(estado, 34);
    expect(estado.semanaActual).toBe(65);
    expect(estado.faseActual).toBe('ESTATAL');

    estado = avanzarSemanasEnLaboratorio(estado, 1);
    expect(estado.semanaActual).toBe(66);
    expect(estado.faseActual).toBe('FEDERAL');
  });

  it('aplica el drenaje federal de −4.0/sem tras la semana 66', () => {
    const estado = estadoSinComision();
    estado.semanaActual = 66;
    estado.faseActual = 'FEDERAL';
    estado.recursos.resistencia = 80;
    const despues = avanzarSemanasEnLaboratorio(estado, 1);
    expect(despues.recursos.resistencia).toBeCloseTo(80 - DRENAJE_RESISTENCIA_POR_FASE.FEDERAL, 5);
  });
});

describe('Prueba 1 — simulación headless de 100 semanas', () => {
  it('el estratega colectivo recorre las 100 semanas con el calendario correcto', () => {
    const resultado = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 20260906 });
    const calendario = verificarCalendarioDeFases(resultado.traza);
    expect(calendario.incidencias).toEqual([]);
    expect(calendario.correcto).toBe(true);
    expect(resultado.semanasJugadas).toBeLessThanOrEqual(SEMANAS_TOTALES);
    expect(resultado.traza.length).toBeGreaterThan(50);
  });

  it('la simulación es determinista: misma semilla, misma partida', () => {
    const a = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 777 });
    const b = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 777 });
    expect(b.desenlace).toBe(a.desenlace);
    expect(b.semanasJugadas).toBe(a.semanasJugadas);
    expect(b.traza).toEqual(a.traza);
  });

  it('semillas distintas producen partidas distintas (el Event Deck sí varía)', () => {
    const a = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 1 });
    const b = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 999_999 });
    expect(a.traza).not.toEqual(b.traza);
  });

  it('no supera nunca las 100 semanas', () => {
    for (const semilla of [1, 42, 2026, 555_555]) {
      const r = simularPartida(ESTRATEGA_COLECTIVO, { semilla });
      expect(r.estadoFinal.semanaActual).toBeLessThanOrEqual(SEMANAS_TOTALES);
    }
  });

  it('quien no hace nada pierde por congeladora, no por otra vía', () => {
    const r = simularPartida(OBSERVADOR_PASIVO, { semilla: 20260906 });
    expect(r.desenlace).toBe('DERROTA_CONGELADORA');
  });
});
