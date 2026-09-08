/**
 * PRUEBA 4 DE LA GUIA — Victoria / Derrota.
 *
 * Verifica los cuatro desenlaces del esquema `EstadoJuego` y la pantalla de
 * promulgacion en el Diario Oficial de la Federacion.
 */

import { describe, expect, it } from 'vitest';

import {
  SEMANAS_TOTALES,
  VICTORIA,
  contarVotos,
  crearEstadoInicial,
  evaluarRequisitosVictoria,
} from '../index';
import { ESTRATEGA_COLECTIVO } from '../../sim/politicas';
import { simularPartida } from '../../sim/simulador';
import { avanzarSemanas, conSistemasDesbloqueados, estadoSinComision } from './ayudas';

describe('Derrota por congeladora', () => {
  it('congela la comisión cuando el reloj llega a cero y termina la partida', () => {
    let estado = conSistemasDesbloqueados(crearEstadoInicial({ saltarNivel0: true }));
    estado.comisionActiva!.relojCongeladoraSemanas = 1;
    estado = avanzarSemanas(estado, 1);

    expect(estado.comisionActiva?.congelada).toBe(true);
    expect(estado.estadoJuego).toBe('DERROTA_CONGELADORA');
    expect(estado.sellos).toContain('CONGELADORA');
    expect(estado.rutaLegislativa.find((n) => n.id === 'com-gobernacion')?.estado).toBe('CONGELADO');
  });

  it('agotar las 100 semanas sin promulgación también archiva el expediente', () => {
    let estado = estadoSinComision();
    estado.semanaActual = SEMANAS_TOTALES;
    estado.faseActual = 'FEDERAL';
    estado.recursos.resistencia = 80;
    estado = avanzarSemanas(estado, 1);

    expect(estado.estadoJuego).toBe('DERROTA_CONGELADORA');
    expect(estado.semanaActual).toBe(SEMANAS_TOTALES);
  });

  it('no acepta comandos después del desenlace', () => {
    let estado = conSistemasDesbloqueados(crearEstadoInicial({ saltarNivel0: true }));
    estado.comisionActiva!.relojCongeladoraSemanas = 1;
    estado = avanzarSemanas(estado, 1);

    const despues = avanzarSemanas(estado, 5);
    expect(despues.semanaActual).toBe(estado.semanaActual);
  });
});

describe('Derrota por burnout', () => {
  it('se declara en cuanto la resistencia toca cero', () => {
    let estado = estadoSinComision();
    estado.recursos.resistencia = 0.4;
    estado = avanzarSemanas(estado, 1);
    expect(estado.recursos.resistencia).toBe(0);
    expect(estado.estadoJuego).toBe('DERROTA_BURNOUT');
  });
});

describe('Victoria — promulgación en el DOF', () => {
  it('exige cámara revisora, resistencia, apoyo social y 65% de votos federales', () => {
    const estado = crearEstadoInicial({ saltarNivel0: true });
    const requisitos = evaluarRequisitosVictoria(estado);
    expect(requisitos.senadoAprobado).toBe(false);
    expect(requisitos.cumplidos).toBe(false);
  });

  it('el estratega colectivo llega al DOF antes de la semana 100', () => {
    const resultado = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 20260906 });
    const { estadoFinal } = resultado;

    expect(resultado.desenlace).toBe('VICTORIA_DOF');
    expect(estadoFinal.semanaActual).toBeLessThanOrEqual(SEMANAS_TOTALES);
    expect(estadoFinal.sellos).toContain('PUBLICADO_DOF');
    expect(estadoFinal.rutaLegislativa.find((n) => n.id === 'dof')?.estado).toBe('APROBADO');
    expect(estadoFinal.recursos.resistencia).toBeGreaterThanOrEqual(VICTORIA.resistenciaMinima);
    expect(estadoFinal.recursos.apoyoSocial).toBeGreaterThanOrEqual(VICTORIA.apoyoSocialMinimo);
    expect(estadoFinal.registro.at(-1)?.tipo).toBe('DESENLACE');
  });

  it('la comisión de Diputados se dictaminó con al menos 65% de votos a favor', () => {
    const { estadoFinal } = simularPartida(ESTRATEGA_COLECTIVO, { semilla: 20260906 });
    const diputados = estadoFinal.comisionesResueltas.find((c) => c.id === 'com-unidas');
    expect(diputados).toBeDefined();
    expect(contarVotos(diputados!).porcentajeFavor).toBeGreaterThanOrEqual(
      VICTORIA.porcentajeVotosFederales,
    );
  });
});

describe('Conteo de votos y semáforo parlamentario', () => {
  it('clasifica las posturas de la comisión activa', () => {
    const estado = crearEstadoInicial({ saltarNivel0: true });
    const conteo = contarVotos(estado.comisionActiva);
    expect(conteo.total).toBe(7);
    expect(conteo.FAVOR + conteo.INDECISO + conteo.OPOSITOR).toBe(conteo.total);
    // v2.2: la Comisión de Gobernación exige 5 de 7 (recalibración municipal).
    expect(conteo.requeridos).toBe(5);
    expect(conteo.suficientes).toBe(false);
  });

  it('devuelve un conteo vacío si no hay comisión activa', () => {
    const conteo = contarVotos(null);
    expect(conteo.total).toBe(0);
    expect(conteo.suficientes).toBe(false);
  });
});
