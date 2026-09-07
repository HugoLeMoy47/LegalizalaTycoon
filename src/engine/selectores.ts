/**
 * Selectores puros para la capa de presentacion.
 *
 * La UI NO calcula reglas de juego: pregunta aqui. Esto mantiene el limite
 * del principio de "Logica Pura Desacoplada" incluso para los derivados
 * cosmeticos (colores de barra, textos de estado, estimaciones distorsionadas).
 */

import {
  COSTO_APOYO_POR_HORA_CABILDEO,
  FACTOR_DRENAJE_APOYO_POR_PRESION,
  SESGO_PESIMISTA_NIEBLA,
  UMBRAL_NIEBLA_MENTAL,
  VICTORIA,
} from './balance';
import { ETIQUETAS_DISTORSION, PENSAMIENTOS_INTRUSIVOS } from './data/narrativa';
import { VERBOS, aliadosActivos, presupuestoHorasLider } from './estado';
import { contarVotos } from './legislativo';
import { horasPorVerbo } from './acciones';
import type { GameState, MiembroColectivo, RegistroEvento, TipoEvento, VerboAccion } from './types';
import { redondear } from './utilidades';

export type NivelRecurso = 'CRITICO' | 'BAJO' | 'MEDIO' | 'ALTO';

export function nivelRecurso(valor: number): NivelRecurso {
  if (valor < 15) return 'CRITICO';
  if (valor < UMBRAL_NIEBLA_MENTAL) return 'BAJO';
  if (valor < 65) return 'MEDIO';
  return 'ALTO';
}

/**
 * Sesgo pesimista de la Niebla Mental (GDD 9): con la resistencia por los
 * suelos, las estimaciones que el jugador ve en pantalla se subvaluan.
 * El motor sigue calculando el valor real; solo la lectura se distorsiona.
 */
export function estimacionMostrada(valorReal: number, nieblaActiva: boolean): number {
  return nieblaActiva ? valorReal * SESGO_PESIMISTA_NIEBLA : valorReal;
}

/**
 * Selecciona pensamientos intrusivos de forma estable (sin consumir el PRNG,
 * para que re-renderizar la UI no altere la simulacion).
 */
export function pensamientosIntrusivos(estado: GameState, cantidad = 3): string[] {
  if (!estado.nieblaMentalActiva) return [];
  const total = PENSAMIENTOS_INTRUSIVOS.length;
  const base = (estado.semanaActual * 3) % total;
  return Array.from({ length: Math.min(cantidad, total) }, (_, i) =>
    PENSAMIENTOS_INTRUSIVOS[(base + i * 4) % total],
  );
}

export function etiquetaDistorsion(pensamiento: string): string {
  return ETIQUETAS_DISTORSION[pensamiento] ?? 'Distorsión cognitiva';
}

export function horasAsignadasTotales(estado: GameState): number {
  return VERBOS.reduce((s, v) => s + estado.asignaciones[v], 0);
}

export function horasDisponibles(estado: GameState): number {
  return presupuestoHorasLider(estado) - horasAsignadasTotales(estado);
}

export interface CapacidadColectivo {
  horasLider: number;
  horasAliados: number;
  horasTotales: number;
  aliados: MiembroColectivo[];
}

export function capacidadColectivo(estado: GameState): CapacidadColectivo {
  const aliados = aliadosActivos(estado);
  const horasLider = presupuestoHorasLider(estado);
  const horasAliados = aliados.reduce((s, m) => s + m.capacidadHoras, 0);
  return { horasLider, horasAliados, horasTotales: horasLider + horasAliados, aliados };
}

export interface ProgresoRuta {
  aprobados: number;
  total: number;
  porcentaje: number;
}

export function progresoRuta(estado: GameState): ProgresoRuta {
  const total = estado.rutaLegislativa.length;
  const aprobados = estado.rutaLegislativa.filter((n) => n.estado === 'APROBADO').length;
  return { aprobados, total, porcentaje: total === 0 ? 0 : (aprobados / total) * 100 };
}

/** Semaforo parlamentario de la comision activa. */
export function semaforoComision(estado: GameState) {
  return contarVotos(estado.comisionActiva);
}

export interface EstadoCongeladora {
  activa: boolean;
  semanasRestantes: number;
  semanasIniciales: number;
  porcentaje: number;
  critico: boolean;
}

export function estadoCongeladora(estado: GameState): EstadoCongeladora {
  const comision = estado.comisionActiva;
  if (!comision || comision.dictamenAprobado) {
    return { activa: false, semanasRestantes: 0, semanasIniciales: 0, porcentaje: 0, critico: false };
  }
  const porcentaje =
    comision.relojInicial === 0
      ? 0
      : (comision.relojCongeladoraSemanas / comision.relojInicial) * 100;
  return {
    activa: true,
    semanasRestantes: comision.relojCongeladoraSemanas,
    semanasIniciales: comision.relojInicial,
    porcentaje,
    critico: comision.relojCongeladoraSemanas <= 4,
  };
}

/** Checklist de la condicion de victoria (GDD 12), para el panel de estado. */
export function checklistVictoria(estado: GameState) {
  return [
    {
      etiqueta: `Resistencia ≥ ${VICTORIA.resistenciaMinima}%`,
      cumplido: estado.recursos.resistencia >= VICTORIA.resistenciaMinima,
    },
    {
      etiqueta: `Apoyo Social ≥ ${VICTORIA.apoyoSocialMinimo}%`,
      cumplido: estado.recursos.apoyoSocial >= VICTORIA.apoyoSocialMinimo,
    },
    {
      etiqueta: 'Iniciativa íntegra (sin mutilar)',
      cumplido: !estado.iniciativaMutilada,
    },
    {
      etiqueta: 'Cámara Revisora superada',
      cumplido: Boolean(estado.banderas.senadoAprobado),
    },
  ];
}

// ---------------------------------------------------------------------------
// Novedades de la bitácora (v2.1)
// ---------------------------------------------------------------------------

/**
 * Entradas que merecen que el jugador se entere. La Gaceta es color narrativo
 * y las de Sistema son avisos de trámite: ninguna reclama atención.
 */
const TIPOS_NOTABLES: TipoEvento[] = ['CRISIS', 'ADVERTENCIA', 'DECISION', 'LOGRO', 'DESENLACE'];

export function esEventoNotable(entrada: RegistroEvento): boolean {
  return TIPOS_NOTABLES.includes(entrada.tipo);
}

/**
 * Lo que pasó desde la última vez que el jugador miró la bitácora.
 *
 * Con el avance de varias semanas es fácil que ocurran cosas sin que nadie las
 * note; esto alimenta el contador de la pestaña y el resumen de la transición.
 */
export function eventosSinLeer(estado: GameState): RegistroEvento[] {
  return estado.registro.slice(estado.registroLeidoHasta ?? 0).filter(esEventoNotable);
}

// ---------------------------------------------------------------------------
// Costo político del cabildeo (v2.1)
// ---------------------------------------------------------------------------

export interface CostoPolitico {
  /** Apoyo Social que se pierde por hora dedicada a cabildear. */
  porHoraDeCabildeo: number;
  /** Apoyo que se pierde esta semana por las horas ya asignadas. */
  porHorasAsignadas: number;
  /** Apoyo que drena por semana la presión política acumulada. */
  porPresionSostenida: number;
  /** Suma semanal, para mostrar de un vistazo. */
  totalSemanal: number;
  /** El drenaje por presión solo aplica con expediente en comisiones. */
  activo: boolean;
}

/**
 * Cabildear cuesta dos veces: las horas queman capital social mientras
 * negocias, y sostener presión alta lo sigue quemando aunque no hagas nada
 * (GDD pilar 2). El jugador no veía la segunda mitad.
 */
export function costoPolitico(estado: GameState): CostoPolitico {
  const horas = horasPorVerbo(estado, 'CABILDEAR');
  const porHorasAsignadas = redondear(horas * COSTO_APOYO_POR_HORA_CABILDEO);
  const porPresionSostenida = estado.comisionDesbloqueada
    ? redondear(estado.recursos.presionPolitica * FACTOR_DRENAJE_APOYO_POR_PRESION)
    : 0;

  return {
    porHoraDeCabildeo: COSTO_APOYO_POR_HORA_CABILDEO,
    porHorasAsignadas,
    porPresionSostenida,
    totalSemanal: redondear(porHorasAsignadas + porPresionSostenida),
    activo: estado.comisionDesbloqueada,
  };
}

// ---------------------------------------------------------------------------
// Guia del turno (v2.1) — qué le toca hacer al jugador esta semana
// ---------------------------------------------------------------------------

export type IdPasoTurno = 'REPARTIR' | 'CABILDEAR' | 'CERRAR';

export interface PasoTurno {
  id: IdPasoTurno;
  numero: number;
  etiqueta: string;
  /** Qué tiene que hacer, en una línea. */
  pista: string;
  /** Ya lo resolvió esta semana. */
  hecho: boolean;
  /** Tiene sentido esta semana (si no, ni se muestra como pendiente). */
  disponible: boolean;
}

/**
 * Secuencia de acciones de la semana. Vive en el motor y no en la UI porque
 * depende de reglas de juego: qué está desbloqueado, si hay votos suficientes,
 * si el líder está inhabilitado por el Descanso Forzado.
 */
export function pasosDelTurno(estado: GameState): PasoTurno[] {
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';
  const asignadas = horasAsignadasTotales(estado);
  const presupuesto = presupuestoHorasLider(estado);
  const aliadosConTarea = aliadosActivos(estado).filter((m) => m.horasAsignadas > 0).length;

  const votos = semaforoComision(estado);
  const faltanVotos = Boolean(estado.comisionActiva) && !votos.suficientes;
  const hayAQuienCabildear = Boolean(
    estado.comisionActiva?.legisladores.some((l) => l.postura !== 'FAVOR'),
  );

  return [
    {
      id: 'REPARTIR',
      numero: 1,
      etiqueta: 'Reparte tus horas',
      pista: enDescanso
        ? 'Estás inhabilitado: solo el colectivo puede trabajar esta semana.'
        : `Distribuye tus ${presupuesto} horas entre las tareas de la semana.`,
      hecho: enDescanso ? aliadosConTarea > 0 : asignadas >= presupuesto,
      disponible: !enDescanso || aliadosActivos(estado).length > 0,
    },
    {
      id: 'CABILDEAR',
      numero: 2,
      etiqueta: 'Convence legisladores',
      pista: faltanVotos
        ? `Te faltan ${votos.requeridos - votos.FAVOR} votos para que la comisión dictamine.`
        : 'Ya tienes los votos que necesita la comisión.',
      hecho: Boolean(estado.comisionActiva) && votos.suficientes,
      disponible: estado.comisionDesbloqueada && faltanVotos && hayAQuienCabildear,
    },
    {
      id: 'CERRAR',
      numero: 3,
      etiqueta: 'Cierra la semana',
      pista:
        estado.decisionPendiente !== null
          ? 'Primero resuelve el dilema que tienes sobre la mesa.'
          : 'Cuando termines, avanza el calendario.',
      hecho: false,
      disponible: estado.decisionPendiente === null,
    },
  ];
}

/** Primer paso pendiente; null si ya solo queda cerrar la semana. */
export function pasoActual(estado: GameState): PasoTurno | null {
  return pasosDelTurno(estado).find((p) => p.disponible && !p.hecho) ?? null;
}

export const ETIQUETA_VERBO: Record<VerboAccion, string> = {
  INVESTIGAR: 'Investigar / Redactar',
  MOVILIZAR: 'Movilizar',
  CABILDEAR: 'Cabildear',
  AUTOCUIDADO: 'Autocuidado',
};

export const DESCRIPCION_VERBO: Record<VerboAccion, string> = {
  INVESTIGAR: 'Blinda el articulado. Sube Solidez Técnica y evita dictámenes devueltos.',
  MOVILIZAR: 'Asambleas, firmas y volanteo. Sube Apoyo Social.',
  CABILDEAR: 'Pasillos y oficinas. Convierte Apoyo Social en Presión Política.',
  AUTOCUIDADO: 'Dormir, comer, terapia, ver a tu gente. Recupera Resistencia.',
};
