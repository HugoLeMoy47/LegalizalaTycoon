/**
 * CORE SIMULATION ENGINE — el ciclo semanal.
 *
 * Implementa literalmente `GUIA_AGENTE_DEV_POC.md` seccion 3.A, con el
 * paso 0 (resolucion de las horas repartidas) antepuesto, porque el trabajo
 * de la semana ocurre antes de que el cuerpo pase la factura.
 *
 *   0. Resolucion de horas asignadas (los 4 verbos)
 *   1. Consumo de Horas Extra          -> resistencia -= (extra/10) * 15 * fatiga
 *   2. Drenaje Pasivo por Fase         -> 0.5 / 1.5 / 4.0
 *   3. Drenaje de Apoyo por Presion    -> apoyo -= presion * 0.05
 *   3.5 Reloj legislativo (dictamen / Pleno)
 *   4. Reloj de la Congeladora         -> -1 semana; a 0 -> congelada
 *   4.5 Economia blanda y despachadores por umbral
 *   5. Chequeo de Niebla Mental        -> resistencia < 30
 *   6. semanaActual += 1
 *   6.5 Transicion de fase, Semana 48 y desenlaces
 *
 * Modulo puro: sin React, sin DOM, sin efectos secundarios fuera del estado.
 */

import {
  aplicarRendimiento,
  asignarHoras,
  asignarHorasAliado,
  cabildearLegislador,
  comprarVoto,
  limpiarAsignaciones,
  meterHorasExtra,
  quitarHorasExtra,
  reclutar,
  resolverDecision,
} from './acciones';
import {
  BLOQUE_HORAS_EXTRA,
  COSTO_OPERATIVO_SEMANAL,
  COSTO_RESISTENCIA_POR_BLOQUE,
  DECAIMIENTO_PRESION_BASE,
  DRENAJE_RESISTENCIA_POR_FASE,
  FACTOR_DRENAJE_APOYO_POR_PRESION,
  FONDOS_POR_PUNTO_DE_APOYO,
  INCREMENTO_FATIGA_ACUMULADA,
  PISO_DECAIMIENTO_SIN_AGENDA,
  PROPORCION_DECAIMIENTO_SIN_AGENDA,
  SEMANAS_ANTES_DE_FATIGA_ACUMULADA,
  SEMANA_DISPARADOR_BURNOUT,
  TOPE_MULTIPLICADOR_FATIGA,
  UMBRAL_NIEBLA_MENTAL,
} from './balance';
import { TITULARES_GACETA } from './data/narrativa';
import { aplicarDescansoForzado, despacharEventos, dispararSemana48 } from './disparadores';
import { esSemanaDeDescanso } from './estado';
import {
  avanzarRelojCongeladora,
  evaluarDesenlace,
  evaluarTransicionDeFase,
  resolverLegislativo,
} from './legislativo';
import type { ComandoJuego, GameState, ResultadoComando, ResumenTurno } from './types';
import { acotar, clonarEstado, elegir, redondear, registrar } from './utilidades';

// ---------------------------------------------------------------------------
// Multiplicador de fatiga acumulada (GDD seccion 8)
// ---------------------------------------------------------------------------

export function multiplicadorFatiga(semanasConsecutivas: number): number {
  if (semanasConsecutivas <= SEMANAS_ANTES_DE_FATIGA_ACUMULADA) return 1;
  const exceso = semanasConsecutivas - SEMANAS_ANTES_DE_FATIGA_ACUMULADA;
  return Math.min(TOPE_MULTIPLICADOR_FATIGA, 1 + exceso * INCREMENTO_FATIGA_ACUMULADA);
}

// ---------------------------------------------------------------------------
// Ciclo semanal
// ---------------------------------------------------------------------------

function procesarSemana(estado: GameState): void {
  const antes = {
    apoyoSocial: estado.recursos.apoyoSocial,
    presionPolitica: estado.recursos.presionPolitica,
    resistencia: estado.recursos.resistencia,
    solidezTecnica: estado.solidezTecnica,
  };
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';

  // --- Paso 0: resolucion de las horas repartidas -------------------------
  const rendimiento = aplicarRendimiento(estado);

  // --- Paso 1: consumo de horas extra -------------------------------------
  const bloquesExtra = estado.recursos.horasExtraMetidas / BLOQUE_HORAS_EXTRA;
  estado.semanasConsecutivasHorasExtra = bloquesExtra > 0 ? estado.semanasConsecutivasHorasExtra + 1 : 0;
  if (bloquesExtra > 0) {
    const fatiga = multiplicadorFatiga(estado.semanasConsecutivasHorasExtra);
    const costo = bloquesExtra * COSTO_RESISTENCIA_POR_BLOQUE * fatiga;
    estado.recursos.resistencia = acotar(estado.recursos.resistencia - costo);
    if (fatiga > 1) {
      registrar(
        estado,
        'ADVERTENCIA',
        'Fatiga acumulada',
        `Llevas ${estado.semanasConsecutivasHorasExtra} semanas seguidas forzando la jornada. El desgaste se multiplica ×${fatiga.toFixed(2)}: −${redondear(costo)}% de Resistencia esta semana.`,
      );
    }
  }

  // --- Paso 2: drenaje pasivo de resistencia por fase ---------------------
  estado.recursos.resistencia = acotar(
    estado.recursos.resistencia - DRENAJE_RESISTENCIA_POR_FASE[estado.faseActual],
  );

  // Descanso Forzado: la recuperacion entra despues del drenaje pasivo.
  if (enDescanso) aplicarDescansoForzado(estado);

  // --- Paso 3: drenaje de apoyo social por presion sostenida --------------
  estado.recursos.apoyoSocial = acotar(
    estado.recursos.apoyoSocial -
      estado.recursos.presionPolitica * FACTOR_DRENAJE_APOYO_POR_PRESION,
  );

  // --- Paso 3.1: la presion politica es perecedera ------------------------
  const sinAgenda = estado.comisionActiva === null;
  const perdidaPresion = sinAgenda
    ? Math.max(
        PISO_DECAIMIENTO_SIN_AGENDA,
        estado.recursos.presionPolitica * PROPORCION_DECAIMIENTO_SIN_AGENDA,
      )
    : DECAIMIENTO_PRESION_BASE;
  estado.recursos.presionPolitica = acotar(estado.recursos.presionPolitica - perdidaPresion);

  // --- Paso 3.5: reloj legislativo ----------------------------------------
  resolverLegislativo(estado);

  // --- Paso 4: reloj de la congeladora ------------------------------------
  const relojCongeladoPorColectivo = enDescanso && (estado.reporteSemana48?.colectivoSostuvo ?? false);
  if (!relojCongeladoPorColectivo) avanzarRelojCongeladora(estado);

  // --- Paso 4.5: economia blanda y despachadores por umbral ---------------
  aplicarEconomiaSemanal(estado);
  if (estado.estadoJuego === 'JUGANDO' || enDescanso) despacharEventos(estado);
  publicarGaceta(estado);

  // --- Paso 5: chequeo de niebla mental -----------------------------------
  const nieblaPrevia = estado.nieblaMentalActiva;
  estado.nieblaMentalActiva = estado.recursos.resistencia < UMBRAL_NIEBLA_MENTAL;
  if (estado.nieblaMentalActiva && !nieblaPrevia) {
    registrar(
      estado,
      'CRISIS',
      'Niebla mental',
      'Insomnio, taquicardia y la sensación de que todo se cae si te detienes. Las estimaciones que ves en pantalla ya no son confiables.',
    );
  } else if (!estado.nieblaMentalActiva && nieblaPrevia) {
    registrar(
      estado,
      'LOGRO',
      'Vuelve la claridad',
      'Dormiste, comiste a tus horas y volviste a distinguir lo urgente de lo importante.',
    );
  }

  // --- Paso 6: incremento de semana ---------------------------------------
  estado.semanaActual += 1;

  // --- Paso 6.5: fase, semana 48 y desenlaces -----------------------------
  evaluarTransicionDeFase(estado);
  gestionarDescansoForzado(estado);
  evaluarDesenlace(estado);

  // --- Cierre de turno -----------------------------------------------------
  estado.ultimoTurno = {
    semana: estado.semanaActual - 1,
    fase: estado.faseActual,
    deltaApoyoSocial: redondear(estado.recursos.apoyoSocial - antes.apoyoSocial),
    deltaPresionPolitica: redondear(estado.recursos.presionPolitica - antes.presionPolitica),
    deltaResistencia: redondear(estado.recursos.resistencia - antes.resistencia),
    deltaSolidezTecnica: redondear(estado.solidezTecnica - antes.solidezTecnica),
    horasTrabajadas: rendimiento.horasTotales,
    horasExtra: estado.recursos.horasExtraMetidas,
  } satisfies ResumenTurno;

  limpiarAsignaciones(estado);
  estado.recursos.horasExtraMetidas = 0;
}

/** Donaciones proporcionales al apoyo, menos el costo fijo de operacion. */
function aplicarEconomiaSemanal(estado: GameState): void {
  const ingreso = Math.round(estado.recursos.apoyoSocial * FONDOS_POR_PUNTO_DE_APOYO);
  estado.recursos.fondos = Math.max(0, estado.recursos.fondos + ingreso - COSTO_OPERATIVO_SEMANAL);
}

/** Color de gaceta cada cuatro semanas; sin efecto mecanico. */
function publicarGaceta(estado: GameState): void {
  if (estado.semanaActual % 4 !== 0) return;
  const titular = elegir(estado, TITULARES_GACETA[estado.faseActual]);
  registrar(estado, 'GACETA', 'Gaceta parlamentaria', titular);
}

/** Entra y sale del Descanso Forzado Obligatorio segun el calendario. */
function gestionarDescansoForzado(estado: GameState): void {
  if (estado.estadoJuego !== 'JUGANDO' && estado.estadoJuego !== 'DESCANSO_FORZADO_SEM_48') return;

  if (estado.semanaActual === SEMANA_DISPARADOR_BURNOUT && !estado.banderas.semana48) {
    dispararSemana48(estado);
    return;
  }

  if (esSemanaDeDescanso(estado.semanaActual) && estado.banderas.semana48) {
    estado.estadoJuego = 'DESCANSO_FORZADO_SEM_48';
    return;
  }

  if (estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48') {
    estado.estadoJuego = 'JUGANDO';
    registrar(
      estado,
      'SISTEMA',
      'Regresas a la coordinación',
      estado.reporteSemana48?.colectivoSostuvo
        ? 'Vuelves y el expediente sigue vivo. Alguien más lo sostuvo y el mundo no se acabó.'
        : 'Vuelves a una mesa llena de pendientes que nadie levantó. La lección costó cara.',
    );
  }
}

// ---------------------------------------------------------------------------
// API publica del motor
// ---------------------------------------------------------------------------

export function avanzarSemana(estadoOriginal: GameState): ResultadoComando {
  if (estadoOriginal.decisionPendiente) {
    return {
      estado: estadoOriginal,
      ok: false,
      mensaje: 'Hay un dilema sobre la mesa. Resuélvelo antes de avanzar la semana.',
    };
  }
  if (
    estadoOriginal.estadoJuego !== 'JUGANDO' &&
    estadoOriginal.estadoJuego !== 'DESCANSO_FORZADO_SEM_48'
  ) {
    return { estado: estadoOriginal, ok: false, mensaje: 'La partida terminó.' };
  }

  const estado = clonarEstado(estadoOriginal);
  procesarSemana(estado);
  return { estado, ok: true };
}

/**
 * Frontera unica entre la capa de presentacion y el motor.
 * Devuelve SIEMPRE un estado nuevo; nunca muta el que recibe.
 */
export function ejecutarComando(
  estadoOriginal: GameState,
  comando: ComandoJuego,
): ResultadoComando {
  if (comando.tipo === 'AVANZAR_SEMANA') return avanzarSemana(estadoOriginal);

  const estado = clonarEstado(estadoOriginal);

  switch (comando.tipo) {
    case 'ASIGNAR_HORAS':
      return asignarHoras(estado, comando.verbo, comando.horas);
    case 'ASIGNAR_HORAS_ALIADO':
      return asignarHorasAliado(estado, comando.miembroId, comando.verbo, comando.horas);
    case 'METER_HORAS_EXTRA':
      return meterHorasExtra(estado);
    case 'QUITAR_HORAS_EXTRA':
      return quitarHorasExtra(estado);
    case 'RECLUTAR':
      return reclutar(estado, comando.miembroId);
    case 'CABILDEAR_LEGISLADOR':
      return cabildearLegislador(estado, comando.legisladorId);
    case 'COMPRAR_VOTO':
      return comprarVoto(estado, comando.legisladorId);
    case 'RESOLVER_DECISION':
      return resolverDecision(estado, comando.opcionId);
    default:
      return { estado: estadoOriginal, ok: false, mensaje: 'Comando desconocido.' };
  }
}
