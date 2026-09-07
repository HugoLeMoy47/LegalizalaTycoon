/**
 * Despachadores por umbral critico (GUIA seccion 4, GDD seccion 8) y
 * dilemas eticos.
 */

import { describe, expect, it } from 'vitest';

import {
  CASTIGO_ALERTA_REGIMEN_APOYO,
  CASTIGO_MUTILACION_APOYO,
  UMBRAL_ALERTA_REGIMEN,
  UMBRAL_OFERTA_MUTILACION,
  UMBRAL_RUPTURA_INTERNA,
  crearEstadoInicial,
  dispararAlertaDelRegimen,
  dispararOfertaMutilacion,
  dispararRupturaInterna,
  ejecutarComando,
} from '../index';
import { aplicar, avanzarSemanas, estadoSinComision } from './ayudas';

describe('Alerta del Régimen (presión ≥ 80)', () => {
  it('no se dispara por debajo del umbral', () => {
    const estado = estadoSinComision();
    estado.recursos.presionPolitica = UMBRAL_ALERTA_REGIMEN - 1;
    const apoyoAntes = estado.recursos.apoyoSocial;
    dispararAlertaDelRegimen(estado);
    expect(estado.recursos.apoyoSocial).toBe(apoyoAntes);
  });

  it('castiga el apoyo social si no hay vocería que conteng el golpe', () => {
    const estado = estadoSinComision();
    estado.recursos.presionPolitica = UMBRAL_ALERTA_REGIMEN;
    estado.recursos.apoyoSocial = 60;
    dispararAlertaDelRegimen(estado);
    expect(estado.recursos.apoyoSocial).toBeCloseTo(60 - CASTIGO_ALERTA_REGIMEN_APOYO, 5);
    expect(estado.registro.at(-1)?.tipo).toBe('CRISIS');
  });

  it('el vocero con horas asignadas neutraliza la guerra sucia', () => {
    const estado = estadoSinComision();
    estado.recursos.presionPolitica = UMBRAL_ALERTA_REGIMEN + 5;
    estado.recursos.apoyoSocial = 60;
    const vocero = estado.colectivo.find((m) => m.rol === 'VOCERO')!;
    vocero.activo = true;
    vocero.horasAsignadas = 20;
    vocero.verboAsignado = 'CABILDEAR';

    dispararAlertaDelRegimen(estado);
    expect(estado.recursos.apoyoSocial).toBe(60);
    expect(estado.registro.at(-1)?.titulo).toContain('contenida');
  });
});

describe('Ruptura interna (apoyo < 25)', () => {
  it('fractura el movimiento cuando el apoyo se desploma', () => {
    const estado = estadoSinComision();
    estado.recursos.apoyoSocial = UMBRAL_RUPTURA_INTERNA - 1;
    estado.recursos.presionPolitica = 40;
    dispararRupturaInterna(estado);
    expect(estado.recursos.apoyoSocial).toBeLessThan(UMBRAL_RUPTURA_INTERNA - 1);
    expect(estado.recursos.presionPolitica).toBeLessThan(40);
  });

  it('el enlace de base amortigua la fisura', () => {
    const estado = estadoSinComision();
    estado.recursos.apoyoSocial = 20;
    const enlace = estado.colectivo.find((m) => m.rol === 'ENLACE_BASE')!;
    enlace.activo = true;
    enlace.horasAsignadas = 20;
    enlace.verboAsignado = 'MOVILIZAR';

    dispararRupturaInterna(estado);
    expect(estado.recursos.apoyoSocial).toBe(20);
  });
});

describe('Dilema de la Ley Mutilada', () => {
  function estadoConOfertaEnMesa() {
    const estado = crearEstadoInicial();
    estado.comisionActiva!.relojCongeladoraSemanas = UMBRAL_OFERTA_MUTILACION;
    dispararOfertaMutilacion(estado);
    return estado;
  }

  it('la oferta aparece cuando quedan 3 semanas o menos de reloj', () => {
    const estado = estadoConOfertaEnMesa();
    expect(estado.decisionPendiente?.id).toBe('LEY_MUTILADA');
    expect(estado.decisionPendiente?.opciones.map((o) => o.id)).toEqual(['ACEPTAR', 'RECHAZAR']);
  });

  it('no aparece mientras el reloj tenga holgura', () => {
    const estado = crearEstadoInicial();
    estado.comisionActiva!.relojCongeladoraSemanas = UMBRAL_OFERTA_MUTILACION + 5;
    dispararOfertaMutilacion(estado);
    expect(estado.decisionPendiente).toBeNull();
  });

  it('aceptar dictamina la ley y cuesta 35% de apoyo social', () => {
    const estado = estadoConOfertaEnMesa();
    estado.recursos.apoyoSocial = 70;
    const resuelto = ejecutarComando(estado, { tipo: 'RESOLVER_DECISION', opcionId: 'ACEPTAR' });

    expect(resuelto.ok).toBe(true);
    expect(resuelto.estado.iniciativaMutilada).toBe(true);
    expect(resuelto.estado.comisionActiva?.dictamenAprobado).toBe(true);
    expect(resuelto.estado.recursos.apoyoSocial).toBeCloseTo(70 - CASTIGO_MUTILACION_APOYO, 5);
    expect(resuelto.estado.sellos).toContain('DICTAMEN_CON_ENMIENDAS');
    expect(resuelto.estado.decisionPendiente).toBeNull();
  });

  it('rechazar deja la ley íntegra y el reloj corriendo', () => {
    const estado = estadoConOfertaEnMesa();
    const resuelto = ejecutarComando(estado, { tipo: 'RESOLVER_DECISION', opcionId: 'RECHAZAR' });

    expect(resuelto.estado.iniciativaMutilada).toBe(false);
    expect(resuelto.estado.comisionActiva?.dictamenAprobado).toBe(false);
    expect(resuelto.estado.decisionPendiente).toBeNull();
  });

  it('no se puede avanzar la semana con un dilema sobre la mesa', () => {
    const estado = estadoConOfertaEnMesa();
    const intento = ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' });
    expect(intento.ok).toBe(false);
    expect(intento.estado.semanaActual).toBe(estado.semanaActual);
  });
});

describe('Cabildeo directo y compra de votos', () => {
  it('convence a un legislador gastando presión política', () => {
    let estado = crearEstadoInicial();
    estado.recursos.presionPolitica = 60;
    const objetivo = estado.comisionActiva!.legisladores.find((l) => l.postura === 'INDECISO')!;

    estado = aplicar(estado, [{ tipo: 'CABILDEAR_LEGISLADOR', legisladorId: objetivo.id }]);
    const despues = estado.comisionActiva!.legisladores.find((l) => l.id === objetivo.id)!;

    expect(despues.postura).toBe('FAVOR');
    expect(estado.recursos.presionPolitica).toBeCloseTo(60 - objetivo.costoCabildeo, 5);
  });

  it('un opositor necesita dos sesiones para llegar a favor', () => {
    let estado = crearEstadoInicial();
    estado.recursos.presionPolitica = 100;
    const objetivo = estado.comisionActiva!.legisladores.find((l) => l.postura === 'OPOSITOR')!;

    estado = aplicar(estado, [{ tipo: 'CABILDEAR_LEGISLADOR', legisladorId: objetivo.id }]);
    expect(estado.comisionActiva!.legisladores.find((l) => l.id === objetivo.id)!.postura).toBe(
      'INDECISO',
    );

    estado = aplicar(estado, [{ tipo: 'CABILDEAR_LEGISLADOR', legisladorId: objetivo.id }]);
    expect(estado.comisionActiva!.legisladores.find((l) => l.id === objetivo.id)!.postura).toBe(
      'FAVOR',
    );
  });

  it('rechaza el cabildeo si no alcanza la presión política', () => {
    const estado = crearEstadoInicial();
    estado.recursos.presionPolitica = 1;
    const objetivo = estado.comisionActiva!.legisladores.find((l) => l.postura !== 'FAVOR')!;
    const intento = ejecutarComando(estado, {
      tipo: 'CABILDEAR_LEGISLADOR',
      legisladorId: objetivo.id,
    });
    expect(intento.ok).toBe(false);
    expect(intento.mensaje).toContain('Presión Política');
  });

  it('solo la bancada satélite vende su voto en efectivo', () => {
    const estado = crearEstadoInicial();
    const mercenario = estado.comisionActiva!.legisladores.find(
      (l) => l.precioVotoFondos !== undefined,
    )!;
    const integro = estado.comisionActiva!.legisladores.find(
      (l) => l.precioVotoFondos === undefined && l.postura !== 'FAVOR',
    )!;

    const compra = ejecutarComando(estado, { tipo: 'COMPRAR_VOTO', legisladorId: mercenario.id });
    expect(compra.ok).toBe(true);
    expect(
      compra.estado.comisionActiva!.legisladores.find((l) => l.id === mercenario.id)!.postura,
    ).toBe('FAVOR');
    expect(compra.estado.recursos.fondos).toBeLessThan(estado.recursos.fondos);

    const rechazo = ejecutarComando(estado, { tipo: 'COMPRAR_VOTO', legisladorId: integro.id });
    expect(rechazo.ok).toBe(false);
  });
});

describe('Reclutamiento del colectivo', () => {
  it('exige apoyo social mínimo y fondos suficientes', () => {
    const estado = crearEstadoInicial();
    const sofia = estado.colectivo.find((m) => m.rol === 'ABOGADA')!;

    estado.recursos.apoyoSocial = sofia.apoyoSocialMinimo - 1;
    const sinApoyo = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: sofia.id });
    expect(sinApoyo.ok).toBe(false);

    estado.recursos.apoyoSocial = sofia.apoyoSocialMinimo;
    estado.recursos.fondos = 0;
    const sinFondos = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: sofia.id });
    expect(sinFondos.ok).toBe(false);

    estado.recursos.fondos = sofia.costoFondos;
    const exitoso = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: sofia.id });
    expect(exitoso.ok).toBe(true);
    expect(exitoso.estado.colectivo.find((m) => m.rol === 'ABOGADA')!.activo).toBe(true);
    expect(exitoso.estado.recursos.fondos).toBe(0);
  });

  it('las horas de los aliados no salen del presupuesto del líder', () => {
    let estado = crearEstadoInicial();
    estado.recursos.apoyoSocial = 40;
    const lupita = estado.colectivo.find((m) => m.rol === 'ENLACE_BASE')!;

    estado = aplicar(estado, [
      { tipo: 'RECLUTAR', miembroId: lupita.id },
      { tipo: 'ASIGNAR_HORAS', verbo: 'MOVILIZAR', horas: 40 },
      { tipo: 'ASIGNAR_HORAS_ALIADO', miembroId: lupita.id, verbo: 'MOVILIZAR', horas: 20 },
    ]);

    expect(estado.asignaciones.MOVILIZAR).toBe(40);
    expect(estado.colectivo.find((m) => m.id === lupita.id)!.horasAsignadas).toBe(20);

    const antes = estado.recursos.apoyoSocial;
    const despues = avanzarSemanas(estado, 1);
    expect(despues.recursos.apoyoSocial).toBeGreaterThan(antes);
  });
});
