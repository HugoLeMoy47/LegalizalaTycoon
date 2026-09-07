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
  meterHorasExtra,
  quitarHorasExtra,
  reclutar,
  resolverDecision,
} from './acciones';
import {
  BLOQUE_HORAS_EXTRA,
  CADENCIA_GACETA_SEMANAS,
  COSTO_OPERATIVO_SEMANAL,
  COSTO_RESISTENCIA_POR_BLOQUE,
  DECAIMIENTO_PRESION_BASE,
  DRENAJE_RESISTENCIA_POR_FASE,
  FACTOR_DRENAJE_APOYO_POR_PRESION,
  FONDOS_POR_PUNTO_DE_APOYO,
  INCREMENTO_FATIGA_ACUMULADA,
  PISO_DECAIMIENTO_SIN_AGENDA,
  PROPORCION_DECAIMIENTO_SIN_AGENDA,
  RELOJ_CONGELADORA_MUNICIPAL,
  SEMANA_DESBLOQUEO_COLECTIVO,
  SEMANA_DESBLOQUEO_COMISION,
  SEMANAS_ANTES_DE_FATIGA_ACUMULADA,
  SEMANA_DISPARADOR_BURNOUT,
  TOPE_MULTIPLICADOR_FATIGA,
  UMBRAL_NIEBLA_MENTAL,
} from './balance';
import { MEDIOS_FICTICIOS, TITULARES_GACETA } from './data/narrativa';
import { aplicarDescansoForzado, despacharEventos, dispararSemana48 } from './disparadores';
import { VERBOS, esSemanaDeDescanso, lider, marcarNodo, presupuestoHorasLider, sellar } from './estado';
import {
  avanzarRelojCongeladora,
  evaluarDesenlace,
  evaluarTransicionDeFase,
  resolverLegislativo,
} from './legislativo';
import type {
  ComandoJuego,
  GameState,
  MotivoParada,
  ResultadoComando,
  ResumenTurno,
} from './types';
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
    firmas: estado.firmasRecolectadas,
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
  // v2.0: solo desgasta a las bases cuando ya hay expediente en comisiones.
  // Antes de la semana 6 no estás negociando con nadie, así que no hay de qué
  // sospechar (GUIA v2.0 seccion 5.D).
  if (estado.comisionDesbloqueada) {
    estado.recursos.apoyoSocial = acotar(
      estado.recursos.apoyoSocial -
        estado.recursos.presionPolitica * FACTOR_DRENAJE_APOYO_POR_PRESION,
    );
  }

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
  // Nada legislativo ocurre antes de que Oficialía de Partes valide (semana 6).
  if (estado.comisionDesbloqueada) resolverLegislativo(estado);

  // --- Paso 4: reloj de la congeladora ------------------------------------
  const relojCongeladoPorColectivo = enDescanso && (estado.reporteSemana48?.colectivoSostuvo ?? false);
  if (estado.comisionDesbloqueada && !relojCongeladoPorColectivo) {
    avanzarRelojCongeladora(estado);
  }

  // --- Paso 4.5: economia blanda y despachadores por umbral ---------------
  aplicarEconomiaSemanal(estado);
  if (estado.estadoJuego === 'JUGANDO' || enDescanso) despacharEventos(estado);

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

  // --- Paso 6.5: desbloqueos, gaceta, fase, semana 48 y desenlaces --------
  aplicarDesbloqueosEscalonados(estado);
  publicarGaceta(estado);
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
    deltaFirmas: estado.firmasRecolectadas - antes.firmas,
    horasTrabajadas: rendimiento.horasTotales,
    horasExtra: estado.recursos.horasExtraMetidas,
  } satisfies ResumenTurno;

  cerrarReparto(estado);
}

/**
 * Cierre del reparto de horas (v2.1).
 *
 * Las asignaciones **persisten** entre semanas: el jugador las define una vez y
 * siguen rigiendo hasta que decida cambiarlas. Antes se borraban cada turno, y
 * eso obligaba a repartir cien veces lo mismo — la causa de que la partida se
 * sintiera lenta aunque no pasara nada.
 *
 * Las horas extra sí se reinician: son una decisión explícita de "esta semana
 * me desvelo", y dejarlas fijas convertiría la trampa del mártir en un suicidio
 * accidental durante una corrida de varias semanas.
 */
function cerrarReparto(estado: GameState): void {
  estado.recursos.horasExtraMetidas = 0;

  // Al desaparecer las horas extra el presupuesto se encoge; si el reparto ya
  // no cabe, se reduce en proporción para conservar la intención del jugador.
  const presupuesto = presupuestoHorasLider(estado);
  const asignadas = VERBOS.reduce((s, v) => s + estado.asignaciones[v], 0);

  if (asignadas > presupuesto) {
    if (presupuesto <= 0) {
      for (const verbo of VERBOS) estado.asignaciones[verbo] = 0;
    } else {
      const factor = presupuesto / asignadas;
      let repartidas = 0;
      for (const verbo of VERBOS) {
        const nuevas = Math.floor(estado.asignaciones[verbo] * factor);
        estado.asignaciones[verbo] = nuevas;
        repartidas += nuevas;
      }
      // El sobrante por redondeo va al verbo con más horas.
      const sobrante = presupuesto - repartidas;
      if (sobrante > 0) {
        const mayor = VERBOS.reduce((a, b) =>
          estado.asignaciones[a] >= estado.asignaciones[b] ? a : b,
        );
        estado.asignaciones[mayor] += sobrante;
      }
    }
  }

  lider(estado).horasAsignadas = VERBOS.reduce((s, v) => s + estado.asignaciones[v], 0);
}

/** Donaciones proporcionales al apoyo, menos el costo fijo de operacion. */
function aplicarEconomiaSemanal(estado: GameState): void {
  const ingreso = Math.round(estado.recursos.apoyoSocial * FONDOS_POR_PUNTO_DE_APOYO);
  estado.recursos.fondos = Math.max(0, estado.recursos.fondos + ingreso - COSTO_OPERATIVO_SEMANAL);
}

/**
 * Gaceta Semanal (GUIA v2.0 seccion 4.B): titular de prensa satirica cada dos
 * semanas. No tiene efecto mecanico; es retorica de medios. La UI lo muestra
 * como recorte de periodico y lo cierra con `CERRAR_GACETA`.
 */
function publicarGaceta(estado: GameState): void {
  if (estado.semanaActual % CADENCIA_GACETA_SEMANAS !== 0) return;
  const titular = elegir(estado, TITULARES_GACETA[estado.faseActual]);
  const medio = elegir(estado, MEDIOS_FICTICIOS);
  estado.gacetaPendiente = {
    semana: estado.semanaActual,
    fase: estado.faseActual,
    titular,
    medio,
  };
  registrar(estado, 'GACETA', medio, titular);
}

// ---------------------------------------------------------------------------
// Progresion escalonada del early game (GUIA v2.0 seccion 5.B)
// ---------------------------------------------------------------------------

/**
 * Se evalua DESPUES de incrementar la semana, de modo que el reloj de la
 * congeladora nunca corra en el mismo turno en que se abre la comision.
 */
function aplicarDesbloqueosEscalonados(estado: GameState): void {
  // --- Etapa B (semana 4): nace el Cuartel del Colectivo ---
  if (!estado.colectivoDesbloqueado && estado.semanaActual >= SEMANA_DESBLOQUEO_COLECTIVO) {
    estado.colectivoDesbloqueado = true;

    // La abogada pro-bono no se recluta: llega sola, atraída por las firmas.
    const abogada = estado.colectivo.find((m) => m.rol === 'ABOGADA');
    if (abogada) {
      abogada.activo = true;
    }

    estado.hitoPendiente = {
      id: 'COLECTIVO_ABIERTO',
      titulo: '¡Nace el Colectivo Ciudadano!',
      texto: `Las ${estado.firmasRecolectadas} firmas que juntaste en la plaza llegaron a oídos de ${abogada?.nombre ?? 'una abogada pro-bono'}, litigante estratégica que llevaba meses buscando un caso así. Se suma sin cobrar.`,
      efectos: [
        'Se abre el Cuartel del Colectivo',
        `${abogada?.nombre ?? 'La abogada'} aporta +${abogada?.capacidadHoras ?? 20} hrs/semana que no salen de tu Resistencia`,
        `Capacidad total del colectivo: ${estado.recursos.horasBaseSemana + (abogada?.capacidadHoras ?? 20)} hrs/semana`,
        'Puedes reclutar a los demás perfiles cuando tengas apoyo y fondos',
      ],
    };

    registrar(
      estado,
      'LOGRO',
      'Se abre el Cuartel del Colectivo',
      `${abogada?.nombre ?? 'La abogada pro-bono'} se suma al movimiento. Dejaste de estar solo.`,
    );
  }

  // --- Etapa C (semana 6): Oficialia de Partes valida la iniciativa ---
  if (!estado.comisionDesbloqueada && estado.semanaActual >= SEMANA_DESBLOQUEO_COMISION) {
    estado.comisionDesbloqueada = true;

    const comision = estado.comisionActiva;
    if (comision) {
      comision.relojCongeladoraSemanas = RELOJ_CONGELADORA_MUNICIPAL;
      comision.relojInicial = RELOJ_CONGELADORA_MUNICIPAL;
      marcarNodo(estado, comision.nodoId, 'ACTIVO');
    }
    marcarNodo(estado, 'mesa-municipal', 'APROBADO');
    sellar(estado, 'TURNADO');
    sellar(estado, 'EN_COMISION');

    estado.hitoPendiente = {
      id: 'COMISION_ABIERTA',
      titulo: 'Oficialía de Partes valida la iniciativa',
      texto: `Con ${estado.firmasRecolectadas} firmas y el articulado en regla, la ventanilla selló tu iniciativa y la turnó a ${comision?.nombre ?? 'la comisión dictaminadora'}. Ya estás dentro del sistema. Ahora corre el reloj.`,
      sello: 'TURNADO',
      efectos: [
        'Se abre el Panel de la Comisión con los regidores',
        `Arranca el Reloj de la Congeladora: ${RELOJ_CONGELADORA_MUNICIPAL} semanas para dictaminar`,
        'Se habilitan el cabildeo directo y la negociación de votos',
        'A partir de ahora la Presión Política desgasta a tus bases',
      ],
    };

    registrar(
      estado,
      'SISTEMA',
      'Turnada a comisión',
      `${comision?.nombre ?? 'La comisión'} recibe el expediente. Tienes ${RELOJ_CONGELADORA_MUNICIPAL} semanas antes de que el plazo reglamentario expire.`,
    );
  }
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
  estado.ultimoAvance = null;
  estado.registroLeidoHasta = estado.registro.length;
  procesarSemana(estado);
  return { estado, ok: true };
}

/** Tope duro de semanas por corrida: nunca deja al jugador fuera del volante. */
export const MAXIMO_SEMANAS_POR_AVANCE = 8;

/**
 * ¿Ocurrió algo que merezca devolverle el control al jugador?
 *
 * Se evalúa DESPUÉS de simular la semana. Las entradas de Gaceta y de Sistema
 * son color narrativo y no detienen la corrida; todo lo demás sí.
 */
function motivoDeParada(
  estado: GameState,
  marcaRegistro: number,
  faseAntes: GameState['faseActual'],
  estadoJuegoAntes: GameState['estadoJuego'],
): MotivoParada | null {
  if (estado.estadoJuego !== estadoJuegoAntes) return 'CAMBIO_DE_ESTADO';
  if (estado.decisionPendiente) return 'DECISION';
  if (estado.hitoPendiente) return 'HITO';
  if (estado.faseActual !== faseAntes) return 'CAMBIO_DE_FASE';

  const nuevas = estado.registro.slice(marcaRegistro);
  if (nuevas.some((e) => e.tipo !== 'GACETA' && e.tipo !== 'SISTEMA')) return 'EVENTO';

  return null;
}

/**
 * Corre semanas con el reparto vigente hasta que algo requiera atención.
 *
 * El motor simula cada semana exactamente igual que `avanzarSemana`: la Semana
 * 48, el reloj de la congeladora, la fatiga acumulada y los umbrales siguen
 * operando turno a turno. Lo único que cambia es cuándo se le devuelve el
 * control al jugador. Por eso esta mecánica no altera el balance.
 */
export function avanzarHastaEvento(
  estadoOriginal: GameState,
  maximoSemanas = MAXIMO_SEMANAS_POR_AVANCE,
): ResultadoComando {
  const guardia = avanzarSemana(estadoOriginal);
  if (!guardia.ok) return guardia;

  const antes = {
    apoyoSocial: estadoOriginal.recursos.apoyoSocial,
    presionPolitica: estadoOriginal.recursos.presionPolitica,
    resistencia: estadoOriginal.recursos.resistencia,
    solidezTecnica: estadoOriginal.solidezTecnica,
    firmas: estadoOriginal.firmasRecolectadas,
    semana: estadoOriginal.semanaActual,
  };

  const estado = clonarEstado(estadoOriginal);
  estado.registroLeidoHasta = estado.registro.length;
  const tope = Math.max(1, Math.min(maximoSemanas, MAXIMO_SEMANAS_POR_AVANCE));
  let corridas = 0;
  let motivo: MotivoParada = 'LIMITE';

  while (corridas < tope) {
    const marcaRegistro = estado.registro.length;
    const faseAntes = estado.faseActual;
    const estadoJuegoAntes = estado.estadoJuego;

    procesarSemana(estado);
    corridas += 1;

    const parada = motivoDeParada(estado, marcaRegistro, faseAntes, estadoJuegoAntes);
    if (parada) {
      motivo = parada;
      break;
    }
    if (estado.estadoJuego !== 'JUGANDO') {
      motivo = 'CAMBIO_DE_ESTADO';
      break;
    }
  }

  // Los deltas se agregan sobre toda la corrida: es lo que el jugador quiere
  // ver flotando, no lo que cambió en la última de ocho semanas.
  estado.ultimoTurno = {
    semana: estado.semanaActual - 1,
    fase: estado.faseActual,
    deltaApoyoSocial: redondear(estado.recursos.apoyoSocial - antes.apoyoSocial),
    deltaPresionPolitica: redondear(estado.recursos.presionPolitica - antes.presionPolitica),
    deltaResistencia: redondear(estado.recursos.resistencia - antes.resistencia),
    deltaSolidezTecnica: redondear(estado.solidezTecnica - antes.solidezTecnica),
    deltaFirmas: estado.firmasRecolectadas - antes.firmas,
    horasTrabajadas: estado.ultimoTurno?.horasTrabajadas ?? 0,
    horasExtra: 0,
  };

  estado.ultimoAvance = {
    semanaInicio: antes.semana,
    semanaFin: estado.semanaActual,
    semanasCorridas: corridas,
    motivo,
  };

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
  if (comando.tipo === 'AVANZAR_HASTA_EVENTO') {
    return avanzarHastaEvento(estadoOriginal, comando.maximoSemanas);
  }

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
    case 'CERRAR_HITO':
      estado.hitoPendiente = null;
      return { estado, ok: true };
    case 'CERRAR_GACETA':
      estado.gacetaPendiente = null;
      return { estado, ok: true };
    case 'COMPLETAR_ONBOARDING':
      estado.onboardingCompletado = true;
      return { estado, ok: true };
    case 'MARCAR_BITACORA_LEIDA':
      estado.registroLeidoHasta = estado.registro.length;
      return { estado, ok: true };
    default:
      return { estado: estadoOriginal, ok: false, mensaje: 'Comando desconocido.' };
  }
}
