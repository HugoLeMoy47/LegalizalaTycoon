/**
 * NIVEL 0 — "El Rescate de Gael" (GUIA v2.2 sección 2 y criterio 7.1).
 *
 * Completar los tres micro-pasos del chat debe llevar al jugador a la Semana 1
 * con los recursos bonificados, sin haber pagado un peso de mordida.
 */

import { describe, expect, it } from 'vitest';

import {
  PASOS_NIVEL_0,
  RECURSOS_TRAS_NIVEL_0,
  crearEstadoInicial,
  ejecutarComando,
  pasoNivel0,
  type GameState,
} from '../index';

/** Recorre el chat eligiendo siempre la opción cívica. */
function resolverPorLaViaCivica(estado: GameState): GameState {
  let actual = estado;
  for (let i = 0; i < 3; i += 1) {
    const paso = pasoNivel0(actual);
    if (!paso) break;
    const civica = paso.opciones.find((o) => o.civica);
    if (!civica) throw new Error(`El paso ${paso.numero} no tiene salida cívica.`);
    const r = ejecutarComando(actual, { tipo: 'RESPONDER_NIVEL_0', opcionId: civica.id });
    expect(r.ok).toBe(true);
    actual = r.estado;
  }
  return actual;
}

describe('Nivel 0 — flujo del chat', () => {
  it('la partida arranca en el sub-estado del prólogo, no en la semana jugable', () => {
    const estado = crearEstadoInicial();
    expect(estado.estadoJuego).toBe('PROLOGO_NIVEL_0');
    expect(estado.nivel0.paso).toBe(1);
    expect(estado.nivel0.mensajes.length).toBeGreaterThan(0);
  });

  it('no deja correr el reloj de las 100 semanas antes de sacar a Gael', () => {
    const estado = crearEstadoInicial();
    const intento = ejecutarComando(estado, { tipo: 'AVANZAR_SEMANA' });
    expect(intento.ok).toBe(false);
    expect(intento.mensaje).toContain('Gael');
    expect(intento.estado.semanaActual).toBe(1);
  });

  it('los tres pasos avanzan en orden y cierran en la epifanía', () => {
    let estado = crearEstadoInicial();
    expect(PASOS_NIVEL_0).toHaveLength(3);

    for (const paso of PASOS_NIVEL_0) {
      expect(estado.nivel0.paso).toBe(paso.numero);
      const civica = paso.opciones.find((o) => o.civica)!;
      estado = ejecutarComando(estado, {
        tipo: 'RESPONDER_NIVEL_0',
        opcionId: civica.id,
      }).estado;
    }

    expect(estado.nivel0.paso).toBe('EPIFANIA');
    expect(estado.nivel0.mensajes.some((m) => m.texto.includes('Ya salí, banda'))).toBe(true);
  });

  it('bloquea pagar la mordida sin consumir el paso', () => {
    const estado = crearEstadoInicial();
    const mordida = PASOS_NIVEL_0[0].opciones.find((o) => !o.civica)!;

    const r = ejecutarComando(estado, { tipo: 'RESPONDER_NIVEL_0', opcionId: mordida.id });

    expect(r.ok).toBe(true);
    expect(r.estado.nivel0.paso).toBe(1);
    expect(r.estado.nivel0.intentosDeMordida).toBe(1);
    expect(r.estado.nivel0.mensajes.at(-1)?.texto).toContain('mordida');
  });

  it('cada paso cívico mueve el recurso que enseña', () => {
    const inicial = crearEstadoInicial();

    const paso1 = ejecutarComando(inicial, { tipo: 'RESPONDER_NIVEL_0', opcionId: 'IPH' }).estado;
    expect(paso1.solidezTecnica).toBeGreaterThan(inicial.solidezTecnica);

    const paso2 = ejecutarComando(paso1, { tipo: 'RESPONDER_NIVEL_0', opcionId: 'ALERTA' }).estado;
    expect(paso2.recursos.apoyoSocial).toBeGreaterThan(paso1.recursos.apoyoSocial);

    const paso3 = ejecutarComando(paso2, { tipo: 'RESPONDER_NIVEL_0', opcionId: 'DDHH' }).estado;
    expect(paso3.recursos.presionPolitica).toBeGreaterThan(paso2.recursos.presionPolitica);
  });
});

describe('Nivel 0 — transferencia a la Semana 1 (criterio 7.1)', () => {
  it('activar el mandato entrega los recursos bonificados de la guía', () => {
    const listo = resolverPorLaViaCivica(crearEstadoInicial());
    const r = ejecutarComando(listo, { tipo: 'ACTIVAR_MANDATO' });

    expect(r.ok).toBe(true);
    expect(r.estado.estadoJuego).toBe('JUGANDO');
    expect(r.estado.semanaActual).toBe(1);
    expect(r.estado.recursos.apoyoSocial).toBe(RECURSOS_TRAS_NIVEL_0.apoyoSocial);
    expect(r.estado.solidezTecnica).toBe(RECURSOS_TRAS_NIVEL_0.solidezTecnica);
    expect(r.estado.recursos.resistencia).toBe(RECURSOS_TRAS_NIVEL_0.resistencia);
    // La presión que el chat acumuló se queda en la noche del rescate: llegar a
    // la semana 1 con presión rompería el desbloqueo escalonado de la Etapa A.
    expect(r.estado.recursos.presionPolitica).toBe(RECURSOS_TRAS_NIVEL_0.presionPolitica);
  });

  it('no se puede activar el mandato a media conversación', () => {
    const estado = crearEstadoInicial();
    const intento = ejecutarComando(estado, { tipo: 'ACTIVAR_MANDATO' });
    expect(intento.ok).toBe(false);
    expect(intento.estado.estadoJuego).toBe('PROLOGO_NIVEL_0');
  });

  it('emite el evento de telemetría del embudo cívico', () => {
    const listo = resolverPorLaViaCivica(crearEstadoInicial());
    const { estado } = ejecutarComando(listo, { tipo: 'ACTIVAR_MANDATO' });

    const evento = estado.telemetria.find((e) => e.evento === 'NIVEL_0_COMPLETADO');
    expect(evento).toBeDefined();
    expect(evento?.metadata?.mordidaPagada).toBe(false);
    expect(evento?.semana).toBe(1);
  });

  it('el atajo de la simulación deja el mismo estado que jugar el chat', () => {
    const jugado = ejecutarComando(
      resolverPorLaViaCivica(crearEstadoInicial({ semilla: 7 })),
      { tipo: 'ACTIVAR_MANDATO' },
    ).estado;
    const saltado = crearEstadoInicial({ semilla: 7, saltarNivel0: true });

    expect(saltado.recursos.apoyoSocial).toBe(jugado.recursos.apoyoSocial);
    expect(saltado.solidezTecnica).toBe(jugado.solidezTecnica);
    expect(saltado.recursos.resistencia).toBe(jugado.recursos.resistencia);
    expect(saltado.recursos.presionPolitica).toBe(jugado.recursos.presionPolitica);
    expect(saltado.estadoJuego).toBe(jugado.estadoJuego);
  });
});

describe('Gael como aliado reclutable (GUIA v2.2 sección 3)', () => {
  it('existe en el catálogo con su rol y su bonificación de firmas', () => {
    const estado = crearEstadoInicial({ saltarNivel0: true });
    const gael = estado.colectivo.find((m) => m.id === 'gael');

    expect(gael).toBeDefined();
    expect(gael?.rol).toBe('ACTIVISTA_TERRITORIAL');
    expect(gael?.firmasMultiplicador).toBe(1.25);
    expect(gael?.activo).toBe(false);
  });

  it('no se puede reclutar antes de tener firmas ni fase estatal', () => {
    const estado = crearEstadoInicial({ saltarNivel0: true });
    estado.colectivoDesbloqueado = true;
    estado.recursos.apoyoSocial = 80;

    const intento = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: 'gael' });
    expect(intento.ok).toBe(false);
    expect(intento.mensaje).toContain('firmas');
  });

  it('se abre al alcanzar la meta de firmas', () => {
    const estado = crearEstadoInicial({ saltarNivel0: true });
    estado.colectivoDesbloqueado = true;
    estado.recursos.apoyoSocial = 80;
    estado.firmasRecolectadas = 500;

    const r = ejecutarComando(estado, { tipo: 'RECLUTAR', miembroId: 'gael' });
    expect(r.ok).toBe(true);
    expect(r.estado.colectivo.find((m) => m.id === 'gael')?.activo).toBe(true);
  });

  it('multiplica la recolección de firmas cuando trabaja en Movilizar', () => {
    const base = crearEstadoInicial({ saltarNivel0: true });
    base.colectivoDesbloqueado = true;
    base.asignaciones.MOVILIZAR = 40;

    const conGael = structuredClone(base);
    const gael = conGael.colectivo.find((m) => m.id === 'gael')!;
    gael.activo = true;
    gael.verboAsignado = 'MOVILIZAR';
    gael.horasAsignadas = 0; // sin horas propias, para aislar el multiplicador

    const sinTrabajo = ejecutarComando(conGael, { tipo: 'AVANZAR_SEMANA' }).estado;
    const referencia = ejecutarComando(base, { tipo: 'AVANZAR_SEMANA' }).estado;
    expect(sinTrabajo.firmasRecolectadas).toBe(referencia.firmasRecolectadas);

    gael.horasAsignadas = 20;
    const trabajando = ejecutarComando(conGael, { tipo: 'AVANZAR_SEMANA' }).estado;
    expect(trabajando.firmasRecolectadas).toBeGreaterThan(referencia.firmasRecolectadas);
  });
});
