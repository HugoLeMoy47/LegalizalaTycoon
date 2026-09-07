/**
 * Contrato de "Logica Pura Desacoplada" (Bitacora #010).
 *
 * El motor no puede mutar el estado que recibe, ni depender del DOM, ni
 * producir resultados distintos ante la misma semilla.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  calcularRendimiento,
  crearEstadoInicial,
  ejecutarComando,
  estimacionMostrada,
  factorSaturacion,
  acotar,
} from '../index';

const RAIZ_MOTOR = join(process.cwd(), 'src', 'engine');

function archivosDelMotor(directorio = RAIZ_MOTOR): string[] {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      return entrada.name === '__tests__' ? [] : archivosDelMotor(ruta);
    }
    return entrada.name.endsWith('.ts') ? [ruta] : [];
  });
}

describe('Desacoplamiento del Core Engine', () => {
  it('ningún módulo del motor referencia el DOM ni React', () => {
    const prohibidos = [/\bdocument\./, /\bwindow\./, /localStorage/, /from 'react/];
    const infracciones: string[] = [];

    for (const archivo of archivosDelMotor()) {
      const contenido = readFileSync(archivo, 'utf8');
      for (const patron of prohibidos) {
        if (patron.test(contenido)) infracciones.push(`${archivo} → ${patron}`);
      }
    }

    expect(infracciones).toEqual([]);
  });
});

describe('Inmutabilidad de la frontera pública', () => {
  it('ejecutarComando no muta el estado recibido', () => {
    const estado = crearEstadoInicial({ semilla: 42 });
    const copia = structuredClone(estado);

    ejecutarComando(estado, { tipo: 'ASIGNAR_HORAS', verbo: 'MOVILIZAR', horas: 20 });
    ejecutarComando(estado, { tipo: 'METER_HORAS_EXTRA' });
    ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' });

    expect(estado).toEqual(copia);
  });

  it('avanzar la semana devuelve un objeto nuevo', () => {
    const estado = crearEstadoInicial({ semilla: 42 });
    const resultado = ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' });
    expect(resultado.estado).not.toBe(estado);
    expect(resultado.estado.semanaActual).toBe(2);
    expect(estado.semanaActual).toBe(1);
  });

  it('rechaza comandos inválidos sin alterar el estado', () => {
    const estado = crearEstadoInicial();
    const intento = ejecutarComando(estado, {
      tipo: 'CABILDEAR_LEGISLADOR',
      legisladorId: 'no-existe',
    });
    expect(intento.ok).toBe(false);
    expect(intento.mensaje).toBeDefined();
    expect(intento.estado.recursos).toEqual(estado.recursos);
  });
});

describe('Determinismo del generador pseudoaleatorio', () => {
  it('dos partidas con la misma semilla producen el mismo estado', () => {
    const a = crearEstadoInicial({ semilla: 20260906 });
    const b = crearEstadoInicial({ semilla: 20260906 });

    let estadoA = a;
    let estadoB = b;
    for (let i = 0; i < 25; i += 1) {
      estadoA = ejecutarComando(estadoA, { tipo: 'AVANZAR_SEMANA' }).estado;
      estadoB = ejecutarComando(estadoB, { tipo: 'AVANZAR_SEMANA' }).estado;
    }

    expect(estadoB).toEqual(estadoA);
  });
});

describe('Funciones puras de balance', () => {
  it('acotar mantiene los recursos dentro de [0, 100]', () => {
    expect(acotar(-30)).toBe(0);
    expect(acotar(140)).toBe(100);
    expect(acotar(55.5)).toBe(55.5);
    expect(acotar(Number.NaN)).toBe(0);
  });

  it('el factor de saturación decrece con el recurso acumulado', () => {
    expect(factorSaturacion(0)).toBeCloseTo(1, 5);
    expect(factorSaturacion(50)).toBeCloseTo(0.5, 5);
    expect(factorSaturacion(100)).toBeCloseTo(0.05, 5);
    expect(factorSaturacion(50)).toBeGreaterThan(factorSaturacion(80));
  });

  it('el sesgo pesimista solo se aplica con niebla mental activa', () => {
    expect(estimacionMostrada(10, false)).toBe(10);
    expect(estimacionMostrada(10, true)).toBeLessThan(10);
  });

  it('calcularRendimiento no altera el estado (solo proyecta)', () => {
    const estado = crearEstadoInicial();
    estado.asignaciones.MOVILIZAR = 40;
    const copia = structuredClone(estado);
    const proyeccion = calcularRendimiento(estado);

    expect(estado).toEqual(copia);
    expect(proyeccion.apoyoSocial).toBeGreaterThan(0);
    expect(proyeccion.horasTotales).toBe(40);
  });
});

describe('Espejo del historial normativo', () => {
  it('historialEventos refleja cada entrada de la bitácora estructurada', () => {
    let estado = crearEstadoInicial();
    for (let i = 0; i < 10; i += 1) {
      estado = ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' }).estado;
    }
    expect(estado.historialEventos).toHaveLength(estado.registro.length);
    expect(estado.historialEventos[0]).toContain('Iniciativa presentada');
  });
});
