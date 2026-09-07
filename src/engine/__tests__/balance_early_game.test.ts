/**
 * PRUEBA DE BALANCE DEL EARLY GAME (GUIA_REFINAMIENTO_UX_BALANCE_POC v2.0, §6).
 *
 * Nota de adaptación: la guía plantea `avanzarSemana(estado): GameState` desde
 * `src/core/simulation`. En este proyecto la frontera pública del motor es
 * `avanzarSemana(estado): ResultadoComando` (`{ estado, ok, mensaje }`), porque
 * todos los comandos comparten firma y devuelven estado nuevo sin mutar.
 * El helper `avanzar()` desenvuelve el resultado; las aserciones son las de la
 * guía, sin cambios.
 */

import { describe, expect, it } from 'vitest';

import {
  META_FIRMAS,
  RELOJ_CONGELADORA_MUNICIPAL,
  SEMANA_DESBLOQUEO_COLECTIVO,
  SEMANA_DESBLOQUEO_COMISION,
  avanzarSemana,
  crearEstadoInicial,
  ejecutarComando,
  type GameState,
} from '../index';

/** Desenvuelve `ResultadoComando` para leerse como la guía. */
function avanzar(estado: GameState): GameState {
  return avanzarSemana(estado).estado;
}

describe('Balance y Progresión Escalonada (Semanas 1 a 6)', () => {
  it('Debe iniciar con paneles de Colectivo y Comisión bloqueados', () => {
    const estado = crearEstadoInicial();
    expect(estado.semanaActual).toBe(1);
    expect(estado.colectivoDesbloqueado).toBe(false);
    expect(estado.comisionDesbloqueada).toBe(false);
  });

  it('Debe desbloquear el colectivo en la semana 4 sin alterar el reloj legislativo', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < SEMANA_DESBLOQUEO_COLECTIVO; i += 1) {
      estado = avanzar(estado);
    }
    expect(estado.semanaActual).toBe(4);
    expect(estado.colectivoDesbloqueado).toBe(true);
    expect(estado.comisionDesbloqueada).toBe(false);
    // El reloj no debe haber disminuido
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(RELOJ_CONGELADORA_MUNICIPAL);
  });

  it('Debe desbloquear la comisión en la semana 6 y comenzar el reloj de congeladora', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < SEMANA_DESBLOQUEO_COMISION; i += 1) {
      estado = avanzar(estado);
    }
    expect(estado.semanaActual).toBe(6);
    expect(estado.colectivoDesbloqueado).toBe(true);
    expect(estado.comisionDesbloqueada).toBe(true);
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(RELOJ_CONGELADORA_MUNICIPAL);

    // Avanzar a semana 7: el reloj debe haber corrido exactamente 1 turno
    estado = avanzar(estado);
    expect(estado.comisionActiva?.relojCongeladoraSemanas).toBe(RELOJ_CONGELADORA_MUNICIPAL - 1);
  });

  it('Meter horas extra en semanas tempranas debe drenar resistencia severamente', () => {
    let estado = crearEstadoInicial();
    estado.recursos.horasExtraMetidas = 20; // +20 hrs extra
    estado = avanzar(estado);
    // Consumo = (20/10)*15 = 30 + 0.5 pasivo = 30.5
    expect(estado.recursos.resistencia).toBeCloseTo(69.5, 1);
  });
});

describe('Etapa A — El activista solitario (semanas 1 a 3)', () => {
  it('no permite reclutar ni cabildear mientras los paneles están bloqueados', () => {
    const estado = crearEstadoInicial();

    const reclutamiento = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: 'mateo' });
    expect(reclutamiento.ok).toBe(false);
    expect(reclutamiento.mensaje).toContain('base social');

    const objetivo = estado.comisionActiva!.legisladores[0];
    const cabildeo = ejecutarComando(estado, {
      tipo: 'CABILDEAR_LEGISLADOR',
      legisladorId: objetivo.id,
    });
    expect(cabildeo.ok).toBe(false);
    expect(cabildeo.mensaje).toContain('turnada a comisiones');
  });

  it('la presión política no desgasta a las bases antes de entrar a comisiones', () => {
    let estado = crearEstadoInicial();
    estado.recursos.presionPolitica = 80;
    estado.recursos.apoyoSocial = 60;
    estado = avanzar(estado);
    // Sin comisión desbloqueada no aplica `apoyo -= presión × 0.05`.
    expect(estado.recursos.apoyoSocial).toBe(60);
  });

  it('el expediente no tiene sellos ni nodo activo antes de la semana 6', () => {
    const estado = crearEstadoInicial();
    expect(estado.sellos).toEqual([]);
    expect(estado.rutaLegislativa.find((n) => n.id === 'com-gobernacion')?.estado).toBe('PENDIENTE');
    expect(estado.rutaLegislativa.find((n) => n.id === 'mesa-municipal')?.estado).toBe('PENDIENTE');
  });

  it('repartir 20 hrs semanales a Movilizar alcanza la meta de 500 firmas en 3 semanas', () => {
    let estado = crearEstadoInicial();
    for (let semana = 0; semana < 3; semana += 1) {
      estado = ejecutarComando(estado, {
        tipo: 'ASIGNAR_HORAS',
        verbo: 'MOVILIZAR',
        horas: 20,
      }).estado;
      estado = ejecutarComando(estado, {
        tipo: 'ASIGNAR_HORAS',
        verbo: 'INVESTIGAR',
        horas: 20,
      }).estado;
      estado = avanzar(estado);
    }
    expect(estado.semanaActual).toBe(4);
    expect(estado.firmasRecolectadas).toBeGreaterThanOrEqual(META_FIRMAS);
  });
});

describe('Etapa B — Hito del Cuartel (semana 4)', () => {
  it('la abogada pro-bono se suma sola, sin costo de reclutamiento', () => {
    let estado = crearEstadoInicial();
    const fondosIniciales = estado.recursos.fondos;
    for (let i = 1; i < SEMANA_DESBLOQUEO_COLECTIVO; i += 1) estado = avanzar(estado);

    const abogada = estado.colectivo.find((m) => m.rol === 'ABOGADA');
    expect(abogada?.activo).toBe(true);
    expect(abogada?.nombre).toContain('Mariana');
    // No se cobró su costo de reclutamiento: llegó atraída por las firmas.
    expect(estado.recursos.fondos).toBeGreaterThan(fondosIniciales - abogada!.costoFondos);
  });

  it('emite el hito con la capacidad total del colectivo en 60 hrs', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < SEMANA_DESBLOQUEO_COLECTIVO; i += 1) estado = avanzar(estado);

    expect(estado.hitoPendiente?.id).toBe('COLECTIVO_ABIERTO');
    expect(estado.hitoPendiente?.efectos.join(' ')).toContain('60 hrs/semana');

    const cerrado = ejecutarComando(estado, { tipo: 'CERRAR_HITO' });
    expect(cerrado.ok).toBe(true);
    expect(cerrado.estado.hitoPendiente).toBeNull();
  });
});

describe('Etapa C — Oficialía de Partes (semana 6)', () => {
  it('sella el expediente y activa el nodo de la comisión', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < SEMANA_DESBLOQUEO_COMISION; i += 1) estado = avanzar(estado);

    expect(estado.sellos).toContain('TURNADO');
    expect(estado.sellos).toContain('EN_COMISION');
    expect(estado.rutaLegislativa.find((n) => n.id === 'mesa-municipal')?.estado).toBe('APROBADO');
    expect(estado.rutaLegislativa.find((n) => n.id === 'com-gobernacion')?.estado).toBe('ACTIVO');
    expect(estado.hitoPendiente?.id).toBe('COMISION_ABIERTA');
  });

  it('habilita el cabildeo directo una vez abierta la comisión', () => {
    let estado = crearEstadoInicial();
    for (let i = 1; i < SEMANA_DESBLOQUEO_COMISION; i += 1) estado = avanzar(estado);
    estado.recursos.presionPolitica = 60;

    const objetivo = estado.comisionActiva!.legisladores.find((l) => l.postura === 'INDECISO')!;
    const cabildeo = ejecutarComando(estado, {
      tipo: 'CABILDEAR_LEGISLADOR',
      legisladorId: objetivo.id,
    });
    expect(cabildeo.ok).toBe(true);
  });
});

describe('Gaceta Semanal', () => {
  it('publica un titular cada dos semanas y se cierra con CERRAR_GACETA', () => {
    let estado = crearEstadoInicial();
    estado = avanzar(estado); // semana 2
    expect(estado.gacetaPendiente).not.toBeNull();
    expect(estado.gacetaPendiente?.fase).toBe('MUNICIPAL');
    expect(estado.gacetaPendiente?.titular.length).toBeGreaterThan(10);

    const cerrada = ejecutarComando(estado, { tipo: 'CERRAR_GACETA' });
    expect(cerrada.estado.gacetaPendiente).toBeNull();
  });
});
