/**
 * PRUEBA 3 DE LA GUIA — Tension de Horas Extra.
 *
 * Abusar del boton de "Meter Horas Extra" debe hundir la resistencia
 * rápidamente y detonar la Niebla Mental.
 */

import { describe, expect, it } from 'vitest';

import {
  BLOQUE_HORAS_EXTRA,
  COSTO_RESISTENCIA_POR_BLOQUE,
  MAX_BLOQUES_HORAS_EXTRA,
  UMBRAL_NIEBLA_MENTAL,
  crearEstadoInicial,
  ejecutarComando,
  multiplicadorFatiga,
  pensamientosIntrusivos,
} from '../index';
import { LIDER_MARTIR } from '../../sim/politicas';
import { simularPartida } from '../../sim/simulador';
import { aplicar, avanzarSemanas, estadoSinComision } from './ayudas';

describe('Horas extra — mecánica de autoexplotación', () => {
  it('cada bloque suma 10 horas al presupuesto semanal', () => {
    let estado = crearEstadoInicial();
    estado = aplicar(estado, [{ tipo: 'METER_HORAS_EXTRA' }]);
    expect(estado.recursos.horasExtraMetidas).toBe(BLOQUE_HORAS_EXTRA);

    estado = aplicar(estado, [{ tipo: 'ASIGNAR_HORAS', verbo: 'MOVILIZAR', horas: 50 }]);
    expect(estado.asignaciones.MOVILIZAR).toBe(50);
  });

  it('no permite pasar del tope de bloques', () => {
    let estado = crearEstadoInicial();
    for (let i = 0; i < MAX_BLOQUES_HORAS_EXTRA; i += 1) {
      estado = aplicar(estado, [{ tipo: 'METER_HORAS_EXTRA' }]);
    }
    const excedido = ejecutarComando(estado, { tipo: 'METER_HORAS_EXTRA' });
    expect(excedido.ok).toBe(false);
    expect(excedido.estado.recursos.horasExtraMetidas).toBe(
      BLOQUE_HORAS_EXTRA * MAX_BLOQUES_HORAS_EXTRA,
    );
  });

  it('descuenta 15% de resistencia por bloque (fórmula normativa)', () => {
    let estado = estadoSinComision();
    estado = aplicar(estado, [{ tipo: 'METER_HORAS_EXTRA' }, { tipo: 'METER_HORAS_EXTRA' }]);
    const despues = avanzarSemanas(estado, 1);

    const drenajeMunicipal = 0.5;
    const costoEsperado = 2 * COSTO_RESISTENCIA_POR_BLOQUE;
    expect(despues.recursos.resistencia).toBeCloseTo(100 - costoEsperado - drenajeMunicipal, 5);
  });

  it('reinicia el contador de fatiga cuando el jugador descansa una semana', () => {
    let estado = estadoSinComision();
    estado = aplicar(estado, [{ tipo: 'METER_HORAS_EXTRA' }]);
    estado = avanzarSemanas(estado, 1);
    expect(estado.semanasConsecutivasHorasExtra).toBe(1);

    estado = avanzarSemanas(estado, 1); // semana sin horas extra
    expect(estado.semanasConsecutivasHorasExtra).toBe(0);
  });
});

describe('Horas extra — multiplicador de fatiga acumulada', () => {
  it('no penaliza las dos primeras semanas consecutivas', () => {
    expect(multiplicadorFatiga(1)).toBe(1);
    expect(multiplicadorFatiga(2)).toBe(1);
  });

  it('escala a partir de la tercera semana y tiene tope', () => {
    expect(multiplicadorFatiga(3)).toBeCloseTo(1.25, 5);
    expect(multiplicadorFatiga(4)).toBeCloseTo(1.5, 5);
    expect(multiplicadorFatiga(20)).toBeCloseTo(2.0, 5);
  });

  it('el costo real crece con las semanas consecutivas de abuso', () => {
    let estado = estadoSinComision();
    const lecturas: number[] = [];
    for (let semana = 0; semana < 4; semana += 1) {
      const antes = estado.recursos.resistencia;
      estado = aplicar(estado, [{ tipo: 'METER_HORAS_EXTRA' }]);
      estado = avanzarSemanas(estado, 1);
      lecturas.push(antes - estado.recursos.resistencia);
    }
    expect(lecturas[2]).toBeGreaterThan(lecturas[1]);
    expect(lecturas[3]).toBeGreaterThan(lecturas[2]);
  });
});

describe('Horas extra — detonación de la Niebla Mental', () => {
  it('tres semanas al máximo bastan para cruzar el umbral del 30%', () => {
    let estado = estadoSinComision();
    for (let semana = 0; semana < 3; semana += 1) {
      estado = aplicar(estado, [
        { tipo: 'METER_HORAS_EXTRA' },
        { tipo: 'METER_HORAS_EXTRA' },
        { tipo: 'METER_HORAS_EXTRA' },
      ]);
      estado = avanzarSemanas(estado, 1);
    }
    expect(estado.recursos.resistencia).toBeLessThan(UMBRAL_NIEBLA_MENTAL);
    expect(estado.nieblaMentalActiva).toBe(true);
  });

  it('la niebla mental surte pensamientos intrusivos a la interfaz', () => {
    const estado = estadoSinComision();
    expect(pensamientosIntrusivos(estado)).toHaveLength(0);

    estado.recursos.resistencia = 12;
    estado.nieblaMentalActiva = true;
    const pensamientos = pensamientosIntrusivos(estado, 3);
    expect(pensamientos).toHaveLength(3);
    expect(new Set(pensamientos).size).toBe(3);
  });

  it('el líder mártir termina en DERROTA_BURNOUT', () => {
    const resultado = simularPartida(LIDER_MARTIR, { semilla: 20260906 });
    expect(resultado.desenlace).toBe('DERROTA_BURNOUT');
    expect(resultado.estadoFinal.recursos.resistencia).toBe(0);
    // v2.0: la abogada llega sola en la semana 4; lo que el martir nunca hizo
    // fue reclutar al resto ni delegarles una sola hora.
    const reclutadosPorElJugador = resultado.estadoFinal.colectivo.filter(
      (m) => m.activo && (m.rol === 'VOCERO' || m.rol === 'ENLACE_BASE'),
    );
    expect(reclutadosPorElJugador).toHaveLength(0);
  });
});
