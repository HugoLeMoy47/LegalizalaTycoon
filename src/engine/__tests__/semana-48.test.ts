/**
 * PRUEBA 2 DE LA GUIA — Resiliencia en la Semana 48.
 *
 * Un jugador con colectivo sobrevive al Descanso Forzado sin caer a la
 * congeladora; un jugador en solitario sufre parálisis de proyecto.
 */

import { describe, expect, it } from 'vitest';

import {
  ALIADOS_MINIMOS_SEMANA_48,
  CASTIGO_APOYO_SIN_COLECTIVO,
  RECUPERACION_SEMANAL_CON_COLECTIVO,
  SEMANAS_DESCANSO_FORZADO,
  ejecutarComando,
} from '../index';
import { avanzarSemanas, estadoSinComision } from './ayudas';
import type { GameState } from '../index';

/** Campos de trámite que la v2.2 exige en `Comision`; el test no los ejercita. */
const COMISION_DE_PRUEBA = {
  tipo: 'DICTAMINADORA',
  semanasTramite: 0,
  semanasTramiteCumplidas: 0,
  apoyoSocialRequerido: 0,
  seOmiteSiMutilada: false,
} as const;

function estadoEnVisperasDeLa48(conAliados: number): GameState {
  const estado = estadoSinComision(9090);
  estado.semanaActual = 47;
  estado.faseActual = 'ESTATAL';
  estado.recursos.resistencia = 55;
  estado.recursos.apoyoSocial = 60;

  const reclutables = estado.colectivo.filter((m) => m.rol !== 'LIDER');
  for (let i = 0; i < conAliados; i += 1) reclutables[i].activo = true;
  return estado;
}

describe('Semana 48 — Descanso Forzado Obligatorio', () => {
  it('entra en DESCANSO_FORZADO_SEM_48 al llegar a la semana 48', () => {
    const estado = avanzarSemanas(estadoEnVisperasDeLa48(3), 1);
    expect(estado.semanaActual).toBe(48);
    expect(estado.estadoJuego).toBe('DESCANSO_FORZADO_SEM_48');
    expect(estado.reporteSemana48).not.toBeNull();
  });

  it('permanece inhabilitado las semanas 48, 49 y 50 y vuelve en la 51', () => {
    let estado = avanzarSemanas(estadoEnVisperasDeLa48(3), 1);
    for (const semana of SEMANAS_DESCANSO_FORZADO) {
      expect(estado.semanaActual).toBe(semana);
      expect(estado.estadoJuego).toBe('DESCANSO_FORZADO_SEM_48');
      estado = avanzarSemanas(estado, 1);
    }
    expect(estado.semanaActual).toBe(51);
    expect(estado.estadoJuego).toBe('JUGANDO');
  });

  it('el líder no puede recibir horas durante el descanso', () => {
    const estado = avanzarSemanas(estadoEnVisperasDeLa48(3), 1);
    const intento = ejecutarComando(estado, {
      tipo: 'ASIGNAR_HORAS',
      verbo: 'MOVILIZAR',
      horas: 10,
    });
    expect(intento.ok).toBe(false);
    expect(intento.estado.asignaciones.MOVILIZAR).toBe(0);

    const extra = ejecutarComando(estado, { tipo: 'METER_HORAS_EXTRA' });
    expect(extra.ok).toBe(false);
  });
});

describe('Semana 48 — con colectivo (≥2 aliados)', () => {
  it('emite el reporte indicando que el colectivo sostuvo la iniciativa', () => {
    const estado = avanzarSemanas(estadoEnVisperasDeLa48(ALIADOS_MINIMOS_SEMANA_48), 1);
    const reporte = estado.reporteSemana48!;
    expect(reporte.colectivoSostuvo).toBe(true);
    expect(reporte.aliadosActivos).toBeGreaterThanOrEqual(ALIADOS_MINIMOS_SEMANA_48);
    expect(reporte.impactoApoyoSocial).toBe(0);
    expect(reporte.lineas.length).toBeGreaterThan(0);
  });

  it('el líder recupera resistencia cada semana de descanso', () => {
    const antes = avanzarSemanas(estadoEnVisperasDeLa48(3), 1);
    const despues = avanzarSemanas(antes, 1);
    const drenajeEstatal = 1.5;
    expect(despues.recursos.resistencia).toBeCloseTo(
      antes.recursos.resistencia + RECUPERACION_SEMANAL_CON_COLECTIVO - drenajeEstatal,
      5,
    );
  });

  it('congela el reloj de la comisión durante las tres semanas', () => {
    let estado = estadoEnVisperasDeLa48(3);
    estado.comisionActiva = {
      ...COMISION_DE_PRUEBA,
      id: 'com-salud',
      nombre: 'Comisión de prueba',
      fase: 'ESTATAL',
      relojCongeladoraSemanas: 8,
      relojInicial: 12,
      votosFavorRequeridos: 5,
      dictamenAprobado: false,
      congelada: false,
      solidezTecnicaRequerida: 50,
      presionPlenoRequerida: 50,
      nodoId: 'com-salud',
      nodoPlenoId: 'pleno-congreso',
      esUltimaInstancia: false,
      legisladores: [],
    };

    estado = avanzarSemanas(estado, 4); // semanas 48, 49, 50 y 51
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(7); // solo corrió la 51
  });
});

describe('Semana 48 — sin colectivo (líder mártir)', () => {
  it('el reporte documenta la parálisis del proyecto', () => {
    const estado = avanzarSemanas(estadoEnVisperasDeLa48(0), 1);
    const reporte = estado.reporteSemana48!;
    expect(reporte.colectivoSostuvo).toBe(false);
    expect(reporte.aliadosActivos).toBe(0);
    expect(reporte.impactoApoyoSocial).toBe(-CASTIGO_APOYO_SIN_COLECTIVO);
    expect(reporte.impactoRelojSemanas).toBe(-3);
  });

  it('descuenta 25% de apoyo social al entrar al descanso', () => {
    const antes = estadoEnVisperasDeLa48(0);
    const despues = avanzarSemanas(antes, 1);
    expect(despues.recursos.apoyoSocial).toBeLessThanOrEqual(
      antes.recursos.apoyoSocial - CASTIGO_APOYO_SIN_COLECTIVO,
    );
  });

  it('el reloj de la comisión sí corre durante las tres semanas perdidas', () => {
    let estado = estadoEnVisperasDeLa48(0);
    estado.comisionActiva = {
      ...COMISION_DE_PRUEBA,
      id: 'com-salud',
      nombre: 'Comisión de prueba',
      fase: 'ESTATAL',
      relojCongeladoraSemanas: 8,
      relojInicial: 12,
      votosFavorRequeridos: 5,
      dictamenAprobado: false,
      congelada: false,
      solidezTecnicaRequerida: 50,
      presionPlenoRequerida: 50,
      nodoId: 'com-salud',
      nodoPlenoId: 'pleno-congreso',
      esUltimaInstancia: false,
      legisladores: [],
    };

    estado = avanzarSemanas(estado, 4);
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(4); // corrieron las 4
  });

  it('un aliado no basta: el mínimo normativo son 2', () => {
    const estado = avanzarSemanas(estadoEnVisperasDeLa48(1), 1);
    expect(estado.reporteSemana48?.colectivoSostuvo).toBe(false);
  });
});
