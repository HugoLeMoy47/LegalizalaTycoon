/**
 * Acciones del jugador dentro de la semana (todo lo que ocurre ANTES de
 * pulsar "Avanzar Semana"): reparto de horas, autoexplotacion, reclutamiento,
 * cabildeo directo a legisladores y resolucion de dilemas.
 *
 * Todas las funciones reciben un estado ya clonado y lo mutan localmente;
 * la inmutabilidad la garantiza `motor.ts` en la frontera publica.
 */

import {
  BLOQUE_HORAS_EXTRA,
  BONO_ESPECIALISTA,
  CASTIGO_FRICCION_APOYO,
  CASTIGO_MUTILACION_APOYO,
  CONVERSION_APOYO_PRESION,
  COSTO_APOYO_POR_HORA_CABILDEO,
  MAX_BLOQUES_HORAS_EXTRA,
  PISO_SATURACION,
  PROBABILIDAD_FRICCION_NIEBLA,
  RENDIMIENTO_POR_HORA,
} from './balance';
import { VERBOS, aliadosActivos, lider, presupuestoHorasLider, sellar } from './estado';
import type {
  GameState,
  Legislador,
  MiembroColectivo,
  Postura,
  ResultadoComando,
  VerboAccion,
} from './types';
import { acotar, formatearPesos, ocurre, redondear, registrar } from './utilidades';

// ---------------------------------------------------------------------------
// Helpers de postura
// ---------------------------------------------------------------------------

const ESCALA_POSTURA: Postura[] = ['OPOSITOR', 'INDECISO', 'FAVOR'];

export function mejorarPostura(postura: Postura): Postura {
  const i = ESCALA_POSTURA.indexOf(postura);
  return ESCALA_POSTURA[Math.min(i + 1, ESCALA_POSTURA.length - 1)];
}

export function empeorarPostura(postura: Postura): Postura {
  const i = ESCALA_POSTURA.indexOf(postura);
  return ESCALA_POSTURA[Math.max(i - 1, 0)];
}

function rechazo(estado: GameState, mensaje: string): ResultadoComando {
  return { estado, ok: false, mensaje };
}

function exito(estado: GameState): ResultadoComando {
  return { estado, ok: true };
}

// ---------------------------------------------------------------------------
// Reparto de horas
// ---------------------------------------------------------------------------

export function asignarHoras(
  estado: GameState,
  verbo: VerboAccion,
  horas: number,
): ResultadoComando {
  if (estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48') {
    return rechazo(estado, 'Descanso Forzado: el líder no puede recibir horas esta semana.');
  }
  const solicitadas = Math.max(0, Math.round(horas));
  const otras = VERBOS.filter((v) => v !== verbo).reduce((s, v) => s + estado.asignaciones[v], 0);
  const presupuesto = presupuestoHorasLider(estado);
  if (otras + solicitadas > presupuesto) {
    return rechazo(estado, `No te alcanzan las horas: dispones de ${presupuesto - otras}.`);
  }
  estado.asignaciones[verbo] = solicitadas;
  lider(estado).horasAsignadas = otras + solicitadas;
  return exito(estado);
}

export function asignarHorasAliado(
  estado: GameState,
  miembroId: string,
  verbo: VerboAccion | null,
  horas: number,
): ResultadoComando {
  const miembro = estado.colectivo.find((m) => m.id === miembroId);
  if (!miembro) return rechazo(estado, 'Ese perfil no existe en el colectivo.');
  if (miembro.rol === 'LIDER') return rechazo(estado, 'Las horas del líder se reparten aparte.');
  if (!miembro.activo) return rechazo(estado, `${miembro.nombre} todavía no está en el colectivo.`);

  const solicitadas = Math.max(0, Math.min(Math.round(horas), miembro.capacidadHoras));
  miembro.horasAsignadas = verbo === null ? 0 : solicitadas;
  miembro.verboAsignado = solicitadas > 0 ? verbo : null;
  return exito(estado);
}

// ---------------------------------------------------------------------------
// Autoexplotacion
// ---------------------------------------------------------------------------

export function meterHorasExtra(estado: GameState): ResultadoComando {
  if (estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48') {
    return rechazo(estado, 'Estás inhabilitado. No hay horas extra que meter.');
  }
  const bloques = estado.recursos.horasExtraMetidas / BLOQUE_HORAS_EXTRA;
  if (bloques >= MAX_BLOQUES_HORAS_EXTRA) {
    return rechazo(estado, 'Ya no hay más horas en la semana. Ni forzándola.');
  }
  estado.recursos.horasExtraMetidas += BLOQUE_HORAS_EXTRA;
  return exito(estado);
}

export function quitarHorasExtra(estado: GameState): ResultadoComando {
  if (estado.recursos.horasExtraMetidas <= 0) {
    return rechazo(estado, 'No hay horas extra activas.');
  }
  const nuevoTotal = estado.recursos.horasExtraMetidas - BLOQUE_HORAS_EXTRA;
  const asignadas = VERBOS.reduce((s, v) => s + estado.asignaciones[v], 0);
  if (asignadas > estado.recursos.horasBaseSemana + nuevoTotal) {
    return rechazo(estado, 'Primero libera horas asignadas a las tareas.');
  }
  estado.recursos.horasExtraMetidas = nuevoTotal;
  return exito(estado);
}

// ---------------------------------------------------------------------------
// Reclutamiento
// ---------------------------------------------------------------------------

export function reclutar(estado: GameState, miembroId: string): ResultadoComando {
  const miembro = estado.colectivo.find((m) => m.id === miembroId);
  if (!miembro) return rechazo(estado, 'Ese perfil no existe.');
  if (miembro.activo) return rechazo(estado, `${miembro.nombre} ya forma parte del colectivo.`);
  if (estado.recursos.apoyoSocial < miembro.apoyoSocialMinimo) {
    return rechazo(
      estado,
      `${miembro.nombre} necesita ver un movimiento vivo: Apoyo Social ≥ ${miembro.apoyoSocialMinimo}%.`,
    );
  }
  if (estado.recursos.fondos < miembro.costoFondos) {
    return rechazo(
      estado,
      `Faltan fondos para el arranque: ${formatearPesos(miembro.costoFondos)}.`,
    );
  }

  miembro.activo = true;
  estado.recursos.fondos -= miembro.costoFondos;
  registrar(
    estado,
    'LOGRO',
    'Se suma al colectivo',
    `${miembro.nombre} entra como ${etiquetaRol(miembro)}. ${miembro.especialidad}`,
  );
  return exito(estado);
}

function etiquetaRol(miembro: MiembroColectivo): string {
  switch (miembro.rol) {
    case 'ABOGADA':
      return 'abogada del colectivo';
    case 'VOCERO':
      return 'vocería';
    case 'ENLACE_BASE':
      return 'enlace con las bases';
    default:
      return 'coordinación';
  }
}

// ---------------------------------------------------------------------------
// Cabildeo directo
// ---------------------------------------------------------------------------

function buscarLegislador(
  estado: GameState,
  legisladorId: string,
): Legislador | undefined {
  return estado.comisionActiva?.legisladores.find((l) => l.id === legisladorId);
}

export function cabildearLegislador(estado: GameState, legisladorId: string): ResultadoComando {
  if (!estado.comisionActiva) return rechazo(estado, 'No hay comisión activa que cabildear.');
  const objetivo = buscarLegislador(estado, legisladorId);
  if (!objetivo) return rechazo(estado, 'Ese legislador no está en la comisión activa.');
  if (objetivo.postura === 'FAVOR') return rechazo(estado, 'Ya tienes su voto. No lo gastes.');
  if (estado.recursos.presionPolitica < objetivo.costoCabildeo) {
    return rechazo(
      estado,
      `Necesitas ${objetivo.costoCabildeo} puntos de Presión Política para sentarte con ${objetivo.nombre}.`,
    );
  }

  estado.recursos.presionPolitica = acotar(
    estado.recursos.presionPolitica - objetivo.costoCabildeo,
  );

  // Niebla Mental: la irritabilidad del activista dispara fricciones (GDD 9).
  if (estado.nieblaMentalActiva && ocurre(estado, PROBABILIDAD_FRICCION_NIEBLA)) {
    const antes = objetivo.postura;
    objetivo.postura = empeorarPostura(objetivo.postura);
    estado.recursos.apoyoSocial = acotar(estado.recursos.apoyoSocial - CASTIGO_FRICCION_APOYO);
    registrar(
      estado,
      'CRISIS',
      'Reunión que se salió de control',
      `Llegaste sin dormir a la oficina de ${objetivo.nombre}, alzaste la voz y la reunión terminó mal. Postura: ${antes} → ${objetivo.postura}. Apoyo Social −${CASTIGO_FRICCION_APOYO}%.`,
    );
    return exito(estado);
  }

  const antes = objetivo.postura;
  objetivo.postura = mejorarPostura(objetivo.postura);
  registrar(
    estado,
    'LOGRO',
    'Cabildeo efectivo',
    `${objetivo.nombre} pasa de ${antes} a ${objetivo.postura}. Costó ${objetivo.costoCabildeo} de Presión Política.`,
  );
  return exito(estado);
}

/**
 * Compra directa del voto de la bancada satelite (GDD seccion 6).
 * Es eficaz y es sucio: la base social lo huele y cobra factura.
 */
export const CASTIGO_APOYO_COMPRA_VOTO = 4;

export function comprarVoto(estado: GameState, legisladorId: string): ResultadoComando {
  if (!estado.comisionActiva) return rechazo(estado, 'No hay comisión activa.');
  const objetivo = buscarLegislador(estado, legisladorId);
  if (!objetivo) return rechazo(estado, 'Ese legislador no está en la comisión activa.');
  if (objetivo.precioVotoFondos === undefined) {
    return rechazo(estado, `${objetivo.nombre} no cotiza su voto en efectivo. Al menos no contigo.`);
  }
  if (objetivo.postura === 'FAVOR') return rechazo(estado, 'Ya vota a favor.');
  if (estado.recursos.fondos < objetivo.precioVotoFondos) {
    return rechazo(estado, `Su tarifa es ${formatearPesos(objetivo.precioVotoFondos)}.`);
  }

  estado.recursos.fondos -= objetivo.precioVotoFondos;
  objetivo.postura = 'FAVOR';
  estado.recursos.apoyoSocial = acotar(estado.recursos.apoyoSocial - CASTIGO_APOYO_COMPRA_VOTO);
  registrar(
    estado,
    'ADVERTENCIA',
    'Voto etiquetado',
    `${objetivo.nombre} vota a favor a cambio de ${formatearPesos(objetivo.precioVotoFondos)} en "difusión ambiental". En la asamblea alguien preguntó de dónde salió ese dinero. Apoyo Social −${CASTIGO_APOYO_COMPRA_VOTO}%.`,
  );
  return exito(estado);
}

// ---------------------------------------------------------------------------
// Resolucion de las horas al cierre de la semana
// ---------------------------------------------------------------------------

export interface RendimientoSemanal {
  solidezTecnica: number;
  apoyoSocial: number;
  presionPolitica: number;
  resistencia: number;
  costoApoyoCabildeo: number;
  horasTotales: number;
}

/** Horas totales dedicadas a un verbo (lider + aliados). */
export function horasPorVerbo(estado: GameState, verbo: VerboAccion): number {
  const deAliados = aliadosActivos(estado)
    .filter((m) => m.verboAsignado === verbo)
    .reduce((s, m) => s + m.horasAsignadas, 0);
  return estado.asignaciones[verbo] + deAliados;
}

/** Factor de especialista aplicable a un verbo esta semana. */
export function factorEspecialista(estado: GameState, verbo: VerboAccion): number {
  const especialista = aliadosActivos(estado).find((m) => {
    const bono = BONO_ESPECIALISTA[m.rol];
    return bono && bono.verbo === verbo && m.verboAsignado === verbo && m.horasAsignadas > 0;
  });
  return especialista ? BONO_ESPECIALISTA[especialista.rol].factor : 1;
}

/**
 * Rendimientos decrecientes: el esfuerzo rinde menos conforme el recurso se
 * satura. Los primeros puntos de Apoyo Social salen de una asamblea; los
 * ultimos exigen convencer a quien nunca va a las asambleas.
 */
export function factorSaturacion(valorActual: number): number {
  return Math.max(PISO_SATURACION, 1 - valorActual / 100);
}

/** Calcula (sin aplicar) el rendimiento de las horas repartidas esta semana. */
export function calcularRendimiento(estado: GameState): RendimientoSemanal {
  const conversion = CONVERSION_APOYO_PRESION[estado.faseActual];

  const hInvestigar = horasPorVerbo(estado, 'INVESTIGAR');
  const hMovilizar = horasPorVerbo(estado, 'MOVILIZAR');
  const hCabildear = horasPorVerbo(estado, 'CABILDEAR');
  const hAutocuidado = horasPorVerbo(estado, 'AUTOCUIDADO');

  return {
    solidezTecnica: redondear(
      hInvestigar *
        RENDIMIENTO_POR_HORA.INVESTIGAR *
        factorEspecialista(estado, 'INVESTIGAR') *
        factorSaturacion(estado.solidezTecnica),
    ),
    apoyoSocial: redondear(
      hMovilizar *
        RENDIMIENTO_POR_HORA.MOVILIZAR *
        factorEspecialista(estado, 'MOVILIZAR') *
        factorSaturacion(estado.recursos.apoyoSocial),
    ),
    presionPolitica: redondear(
      hCabildear *
        RENDIMIENTO_POR_HORA.CABILDEAR *
        conversion *
        factorEspecialista(estado, 'CABILDEAR') *
        factorSaturacion(estado.recursos.presionPolitica),
    ),
    resistencia: redondear(
      hAutocuidado *
        RENDIMIENTO_POR_HORA.AUTOCUIDADO *
        factorSaturacion(estado.recursos.resistencia),
    ),
    costoApoyoCabildeo: redondear(hCabildear * COSTO_APOYO_POR_HORA_CABILDEO),
    horasTotales: hInvestigar + hMovilizar + hCabildear + hAutocuidado,
  };
}

/** Aplica el rendimiento al estado y limpia el reparto de horas. */
export function aplicarRendimiento(estado: GameState): RendimientoSemanal {
  const r = calcularRendimiento(estado);
  estado.solidezTecnica = acotar(estado.solidezTecnica + r.solidezTecnica);
  estado.recursos.apoyoSocial = acotar(
    estado.recursos.apoyoSocial + r.apoyoSocial - r.costoApoyoCabildeo,
  );
  estado.recursos.presionPolitica = acotar(estado.recursos.presionPolitica + r.presionPolitica);
  estado.recursos.resistencia = acotar(estado.recursos.resistencia + r.resistencia);
  return r;
}

export function limpiarAsignaciones(estado: GameState): void {
  for (const verbo of VERBOS) estado.asignaciones[verbo] = 0;
  for (const miembro of estado.colectivo) {
    miembro.horasAsignadas = 0;
    if (miembro.rol !== 'LIDER') miembro.verboAsignado = null;
  }
}

// ---------------------------------------------------------------------------
// Resolucion de dilemas (modales)
// ---------------------------------------------------------------------------

export function resolverDecision(estado: GameState, opcionId: string): ResultadoComando {
  const decision = estado.decisionPendiente;
  if (!decision) return rechazo(estado, 'No hay ninguna decisión pendiente.');
  const opcion = decision.opciones.find((o) => o.id === opcionId);
  if (!opcion) return rechazo(estado, 'Esa opción no existe en este dilema.');

  switch (decision.id) {
    case 'LEY_MUTILADA':
      resolverLeyMutilada(estado, opcionId);
      break;
    case 'COOPTACION_LIDER':
      resolverCooptacion(estado, opcionId, decision.contexto?.miembroId);
      break;
    case 'CESION_AUTORIA':
      resolverCesionAutoria(estado, opcionId);
      break;
  }

  estado.decisionPendiente = null;
  return exito(estado);
}

/** GUIA seccion 4.C — la oferta de concesion. */
function resolverLeyMutilada(estado: GameState, opcionId: string): void {
  if (opcionId !== 'ACEPTAR') {
    registrar(
      estado,
      'DECISION',
      'Rechazaste el dictamen mutilado',
      'Les dijiste que sin autocultivo y sin presupuesto no hay ley que valga. El reloj sigue corriendo y ahora te miran distinto.',
    );
    return;
  }

  estado.iniciativaMutilada = true;
  if (estado.comisionActiva) estado.comisionActiva.dictamenAprobado = true;
  estado.recursos.apoyoSocial = acotar(estado.recursos.apoyoSocial - CASTIGO_MUTILACION_APOYO);
  sellar(estado, 'DICTAMEN_CON_ENMIENDAS');
  registrar(
    estado,
    'DECISION',
    'Aceptaste el dictamen mutilado',
    `Se aprueba el dictamen sin el artículo de autocultivo y sin presupuesto de salud pública. La foto oficial sale bien; las bases no. Apoyo Social −${CASTIGO_MUTILACION_APOYO}%.`,
  );
}

/** Event deck — Cooptacion de Liderazgo (GDD seccion 13). */
export const COSTO_RETENER_MIEMBRO_FONDOS = 12_000;
export const COSTO_RETENER_MIEMBRO_RESISTENCIA = 6;
export const CASTIGO_PERDER_MIEMBRO_APOYO = 8;

function resolverCooptacion(estado: GameState, opcionId: string, miembroId?: string): void {
  const miembro = estado.colectivo.find((m) => m.id === miembroId);
  if (!miembro) return;

  if (opcionId === 'RETENER') {
    estado.recursos.fondos = Math.max(0, estado.recursos.fondos - COSTO_RETENER_MIEMBRO_FONDOS);
    estado.recursos.resistencia = acotar(
      estado.recursos.resistencia - COSTO_RETENER_MIEMBRO_RESISTENCIA,
    );
    registrar(
      estado,
      'DECISION',
      'Retuviste a tu gente',
      `Conseguiste una beca de la fundación para pagarle a ${miembro.nombre} y te quedaste dos noches armando el oficio. Fondos −${formatearPesos(COSTO_RETENER_MIEMBRO_FONDOS)}, Resistencia −${COSTO_RETENER_MIEMBRO_RESISTENCIA}%.`,
    );
    return;
  }

  miembro.activo = false;
  miembro.horasAsignadas = 0;
  miembro.verboAsignado = null;
  estado.recursos.apoyoSocial = acotar(
    estado.recursos.apoyoSocial - CASTIGO_PERDER_MIEMBRO_APOYO,
  );
  registrar(
    estado,
    'DECISION',
    'Se fue al gobierno',
    `${miembro.nombre} aceptó la dirección general. Te dijo que "desde adentro se cambian más cosas". Apoyo Social −${CASTIGO_PERDER_MIEMBRO_APOYO}%.`,
  );
}

/** Maña caracteristica del Movimiento de la Deformacion (GDD seccion 6). */
export const CASTIGO_CEDER_AUTORIA_APOYO = 15;
export const CASTIGO_NEGAR_AUTORIA_RELOJ = 2;

function resolverCesionAutoria(estado: GameState, opcionId: string): void {
  if (opcionId === 'CEDER') {
    let convertidos = 0;
    for (const l of estado.comisionActiva?.legisladores ?? []) {
      if (l.partido === 'DEFORMACION' && l.postura !== 'FAVOR') {
        l.postura = 'FAVOR';
        convertidos += 1;
      }
    }
    estado.recursos.apoyoSocial = acotar(
      estado.recursos.apoyoSocial - CASTIGO_CEDER_AUTORIA_APOYO,
    );
    registrar(
      estado,
      'DECISION',
      'Cediste la autoría',
      `La iniciativa se presenta ahora como propuesta de la bancada guinda. ${convertidos} voto(s) se alinean de golpe. En el mitin nadie mencionó al colectivo. Apoyo Social −${CASTIGO_CEDER_AUTORIA_APOYO}%.`,
    );
    return;
  }

  if (estado.comisionActiva) {
    estado.comisionActiva.relojCongeladoraSemanas = Math.max(
      0,
      estado.comisionActiva.relojCongeladoraSemanas - CASTIGO_NEGAR_AUTORIA_RELOJ,
    );
  }
  registrar(
    estado,
    'DECISION',
    'La iniciativa sigue siendo del colectivo',
    `Les dijiste que la firma es de la asamblea. "Entonces se va a agendar cuando se pueda." Reloj de la congeladora −${CASTIGO_NEGAR_AUTORIA_RELOJ} semanas.`,
  );
}
