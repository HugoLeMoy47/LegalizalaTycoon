/**
 * NIVEL 0 INTERACTIVO — lógica del "Rescate de Gael" (GUIA v2.2 sección 2).
 *
 * Corre como sub-estado `PROLOGO_NIVEL_0`, antes de que el reloj de las 100
 * semanas empiece a correr. El jugador resuelve tres micro-pasos tácticos en
 * un chat de red vecinal; las opciones que no son cívicas están bloqueadas a
 * propósito y devuelven el turno con una explicación.
 *
 * Módulo puro: sin React, sin DOM.
 */

import { RECURSOS_TRAS_NIVEL_0 } from './balance';
import { EPIFANIA_NIVEL_0, PASOS_NIVEL_0 } from './data/nivel0';
import { emitir } from './telemetria';
import type { EstadoNivel0, GameState, PasoNivel0, ResultadoComando } from './types';
import { acotar, registrar } from './utilidades';

/** Estado inicial del chat: solo la apertura del primer paso. */
export function nivel0Inicial(): EstadoNivel0 {
  return {
    paso: 1,
    mensajes: [...PASOS_NIVEL_0[0].apertura],
    intentosDeMordida: 0,
  };
}

/** Paso vigente del guion, o null si el chat ya terminó su parte jugable. */
export function pasoNivel0(estado: GameState): PasoNivel0 | null {
  const paso = estado.nivel0.paso;
  if (paso !== 1 && paso !== 2 && paso !== 3) return null;
  return PASOS_NIVEL_0.find((p) => p.numero === paso) ?? null;
}

export function nivel0Terminado(estado: GameState): boolean {
  return estado.nivel0.paso === 'COMPLETADO';
}

/**
 * Resuelve una opción del chat.
 *
 * Las opciones no cívicas no avanzan el guion: registran el intento, sueltan
 * la explicación pedagógica y dejan al jugador en el mismo paso. Es la única
 * decisión del juego que no se puede tomar, y es deliberado: pagar la mordida
 * no es una estrategia alternativa, es el problema que la partida desmonta.
 */
export function responderNivel0(estado: GameState, opcionId: string): ResultadoComando {
  if (estado.estadoJuego !== 'PROLOGO_NIVEL_0') {
    return { estado, ok: false, mensaje: 'El prólogo ya terminó.' };
  }

  const paso = pasoNivel0(estado);
  if (!paso) return { estado, ok: false, mensaje: 'No hay ninguna decisión abierta en el chat.' };

  const opcion = paso.opciones.find((o) => o.id === opcionId);
  if (!opcion) return { estado, ok: false, mensaje: 'Esa respuesta no existe en el chat.' };

  estado.nivel0.mensajes.push({
    autor: 'Tú',
    avatar: '✊',
    texto: opcion.mensaje,
    propio: true,
  });

  if (!opcion.civica) {
    estado.nivel0.intentosDeMordida += 1;
    estado.nivel0.mensajes.push({
      autor: 'Red Vecinal',
      avatar: '🛑',
      esNota: true,
      texto: opcion.reprimenda ?? 'Esa salida no resuelve nada.',
    });
    return { estado, ok: true };
  }

  // Efectos del paso. Se aplican de inmediato para que el jugador vea moverse
  // las barras mientras juega el chat, no al final.
  const efectos = opcion.efectos ?? {};
  if (efectos.apoyoSocial) {
    estado.recursos.apoyoSocial = acotar(estado.recursos.apoyoSocial + efectos.apoyoSocial);
  }
  if (efectos.presionPolitica) {
    estado.recursos.presionPolitica = acotar(
      estado.recursos.presionPolitica + efectos.presionPolitica,
    );
  }
  if (efectos.solidezTecnica) {
    estado.solidezTecnica = acotar(estado.solidezTecnica + efectos.solidezTecnica);
  }

  estado.nivel0.mensajes.push(...(opcion.respuesta ?? []));

  if (paso.numero < 3) {
    const siguiente = PASOS_NIVEL_0.find((p) => p.numero === paso.numero + 1);
    estado.nivel0.paso = (paso.numero + 1) as 2 | 3;
    if (siguiente) estado.nivel0.mensajes.push(...siguiente.apertura);
  } else {
    estado.nivel0.paso = 'EPIFANIA';
    estado.nivel0.mensajes.push(...EPIFANIA_NIVEL_0);
  }

  return { estado, ok: true };
}

/**
 * Activa el mandato del Art. 71 fr. IV y arranca la Semana 1.
 *
 * Transfiere las bonificaciones del prólogo como valores ABSOLUTOS (ver
 * `RECURSOS_TRAS_NIVEL_0` en `balance.ts`, donde está justificado por qué la
 * Presión Política del guion se queda en la narrativa).
 */
export function activarMandato(estado: GameState): ResultadoComando {
  if (estado.estadoJuego !== 'PROLOGO_NIVEL_0') {
    return { estado, ok: false, mensaje: 'El mandato ya está activo.' };
  }
  if (estado.nivel0.paso !== 'EPIFANIA') {
    return { estado, ok: false, mensaje: 'Primero hay que sacar a Gael del Ministerio Público.' };
  }

  aplicarBonificacionesNivel0(estado);
  estado.nivel0.paso = 'COMPLETADO';
  estado.estadoJuego = 'JUGANDO';

  emitir(estado, 'NIVEL_0_COMPLETADO', {
    intentosDeMordida: estado.nivel0.intentosDeMordida,
    mordidaPagada: false,
  });

  registrar(
    estado,
    'LOGRO',
    'Gael sale libre sin pagar mordida',
    'La red vecinal documentó, se presentó y escaló la queja. Ganaron la noche. Ahora empieza lo otro: cambiar la norma que hizo posible la detención.',
  );
  registrar(
    estado,
    'SISTEMA',
    'Asumes el mandato',
    'Arranca la Etapa A: eres una sola persona con 40 horas a la semana. Antes de pisar el Cabildo necesitas juntar 500 firmas ciudadanas y un articulado que aguante revisión jurídica.',
  );

  return { estado, ok: true };
}

/** Deja el estado como si el jugador hubiera resuelto el Nivel 0 por la vía cívica. */
export function aplicarBonificacionesNivel0(estado: GameState): void {
  estado.recursos.apoyoSocial = RECURSOS_TRAS_NIVEL_0.apoyoSocial;
  estado.solidezTecnica = RECURSOS_TRAS_NIVEL_0.solidezTecnica;
  estado.recursos.resistencia = RECURSOS_TRAS_NIVEL_0.resistencia;
  estado.recursos.presionPolitica = RECURSOS_TRAS_NIVEL_0.presionPolitica;
}
