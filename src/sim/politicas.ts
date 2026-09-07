/**
 * Politicas de juego automatico ("bots") para la simulacion headless.
 *
 * Sirven para dos cosas:
 *  1. Validar el balanceo del motor sin abrir el navegador (Prueba 1 de la GUIA).
 *  2. Dar a las pruebas unitarias escenarios completos y reproducibles
 *     (jugador con colectivo vs. lider martir, abuso de horas extra, etc.).
 */

import type { ComandoJuego, Decision, GameState, MiembroColectivo } from '../engine';
import { VERBOS, contarVotos } from '../engine';

export interface Politica {
  nombre: string;
  descripcion: string;
  /** Comandos a ejecutar durante la semana, antes de avanzarla. */
  planear(estado: GameState): ComandoJuego[];
  /** Respuesta a un dilema modal. Devuelve el id de la opcion elegida. */
  decidir(estado: GameState, decision: Decision): string;
}

// ---------------------------------------------------------------------------
// Helpers compartidos
// ---------------------------------------------------------------------------

function repartirHoras(
  presupuesto: number,
  pesos: Partial<Record<(typeof VERBOS)[number], number>>,
): ComandoJuego[] {
  const total = Object.values(pesos).reduce<number>((s, v) => s + (v ?? 0), 0);
  if (total <= 0) return [];
  const comandos: ComandoJuego[] = [];
  let restante = presupuesto;
  const entradas = Object.entries(pesos) as [(typeof VERBOS)[number], number][];

  entradas.forEach(([verbo, peso], indice) => {
    const esUltimo = indice === entradas.length - 1;
    const horas = esUltimo ? restante : Math.floor((presupuesto * peso) / total);
    restante -= horas;
    if (horas > 0) comandos.push({ tipo: 'ASIGNAR_HORAS', verbo, horas });
  });

  return comandos;
}

function asignarAliados(estado: GameState): ComandoJuego[] {
  const destino: Record<MiembroColectivo['rol'], 'INVESTIGAR' | 'CABILDEAR' | 'MOVILIZAR' | null> = {
    LIDER: null,
    ABOGADA: 'INVESTIGAR',
    VOCERO: 'CABILDEAR',
    ENLACE_BASE: 'MOVILIZAR',
  };
  return estado.colectivo
    .filter((m) => m.rol !== 'LIDER' && m.activo)
    .map((m) => ({
      tipo: 'ASIGNAR_HORAS_ALIADO' as const,
      miembroId: m.id,
      verbo: destino[m.rol],
      horas: m.capacidadHoras,
    }));
}

function reclutamientosPosibles(estado: GameState): ComandoJuego[] {
  let fondos = estado.recursos.fondos;
  const comandos: ComandoJuego[] = [];
  for (const m of estado.colectivo) {
    if (m.rol === 'LIDER' || m.activo) continue;
    if (estado.recursos.apoyoSocial < m.apoyoSocialMinimo) continue;
    if (fondos < m.costoFondos) continue;
    fondos -= m.costoFondos;
    comandos.push({ tipo: 'RECLUTAR', miembroId: m.id });
  }
  return comandos;
}

/** Cabildeo greedy: convence primero a los mas baratos hasta juntar los votos. */
function cabildeoGreedy(estado: GameState, presionReservada = 0): ComandoJuego[] {
  const comision = estado.comisionActiva;
  if (!comision || comision.dictamenAprobado || comision.congelada) return [];

  const votos = contarVotos(comision);
  let faltan = votos.requeridos - votos.FAVOR;
  if (faltan <= 0) return [];

  let presion = estado.recursos.presionPolitica - presionReservada;
  const comandos: ComandoJuego[] = [];
  const objetivos = comision.legisladores
    .filter((l) => l.postura !== 'FAVOR')
    .sort((a, b) => a.costoCabildeo - b.costoCabildeo);

  for (const l of objetivos) {
    // Un OPOSITOR necesita dos sesiones para llegar a FAVOR.
    const sesiones = l.postura === 'OPOSITOR' ? 2 : 1;
    for (let i = 0; i < sesiones; i += 1) {
      if (presion < l.costoCabildeo) break;
      presion -= l.costoCabildeo;
      comandos.push({ tipo: 'CABILDEAR_LEGISLADOR', legisladorId: l.id });
      if (i === sesiones - 1) faltan -= 1;
    }
    if (faltan <= 0) break;
  }

  return comandos;
}

// ---------------------------------------------------------------------------
// 1. Estratega colectivo — el juego "bien jugado"
// ---------------------------------------------------------------------------

export const ESTRATEGA_COLECTIVO: Politica = {
  nombre: 'Estratega colectivo',
  descripcion:
    'Recluta en cuanto puede, delega en aliados, cuida su resistencia y cabildea con lo que le alcanza.',

  planear(estado) {
    const comandos: ComandoJuego[] = [...reclutamientosPosibles(estado), ...asignarAliados(estado)];

    const presupuesto = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48' ? 0 : 40;
    if (presupuesto > 0) {
      const solidezRequerida = estado.comisionActiva?.solidezTecnicaRequerida ?? 30;
      if (estado.recursos.resistencia < 45) {
        comandos.push(...repartirHoras(presupuesto, { AUTOCUIDADO: 6, MOVILIZAR: 2, CABILDEAR: 2 }));
      } else if (estado.solidezTecnica < solidezRequerida) {
        comandos.push(
          ...repartirHoras(presupuesto, { INVESTIGAR: 5, MOVILIZAR: 3, CABILDEAR: 2 }),
        );
      } else if (estado.recursos.apoyoSocial < 45) {
        comandos.push(
          ...repartirHoras(presupuesto, { MOVILIZAR: 5, CABILDEAR: 3, AUTOCUIDADO: 2 }),
        );
      } else {
        comandos.push(
          ...repartirHoras(presupuesto, { CABILDEAR: 5, MOVILIZAR: 3, AUTOCUIDADO: 2 }),
        );
      }
    }

    comandos.push(...cabildeoGreedy(estado));
    return comandos;
  },

  decidir(_estado, decision) {
    switch (decision.id) {
      case 'LEY_MUTILADA':
        return 'RECHAZAR';
      case 'COOPTACION_LIDER':
        return 'RETENER';
      case 'CESION_AUTORIA':
        return 'NEGAR';
    }
  },
};

// ---------------------------------------------------------------------------
// 2. Lider martir — el tropo que el juego busca desmontar
// ---------------------------------------------------------------------------

export const LIDER_MARTIR: Politica = {
  nombre: 'Líder mártir',
  descripcion:
    'No recluta a nadie, mete horas extra todas las semanas y nunca dedica horas al autocuidado.',

  planear(estado) {
    const comandos: ComandoJuego[] = [];
    if (estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48') return comandos;

    comandos.push({ tipo: 'METER_HORAS_EXTRA' });
    comandos.push({ tipo: 'METER_HORAS_EXTRA' });
    comandos.push(...repartirHoras(60, { INVESTIGAR: 2, MOVILIZAR: 3, CABILDEAR: 3 }));
    comandos.push(...cabildeoGreedy(estado));
    return comandos;
  },

  decidir(_estado, decision) {
    switch (decision.id) {
      case 'LEY_MUTILADA':
        return 'ACEPTAR';
      case 'COOPTACION_LIDER':
        return 'DEJAR_IR';
      case 'CESION_AUTORIA':
        return 'CEDER';
    }
  },
};

// ---------------------------------------------------------------------------
// 3. Pasivo — control experimental para medir los drenajes puros
// ---------------------------------------------------------------------------

export const OBSERVADOR_PASIVO: Politica = {
  nombre: 'Observador pasivo',
  descripcion: 'No hace nada en 100 semanas. Sirve para leer los decaimientos limpios.',
  planear: () => [],
  decidir: (_estado, decision) => decision.opciones[decision.opciones.length - 1].id,
};

// ---------------------------------------------------------------------------
// 4. Pragmatico — acepta todos los tratos con tal de avanzar
// ---------------------------------------------------------------------------

export const PRAGMATICO: Politica = {
  nombre: 'Pragmático',
  descripcion: 'Juega bien los recursos pero acepta toda concesión que destrabe el dictamen.',

  planear(estado) {
    return ESTRATEGA_COLECTIVO.planear(estado);
  },

  decidir(_estado, decision) {
    switch (decision.id) {
      case 'LEY_MUTILADA':
        return 'ACEPTAR';
      case 'COOPTACION_LIDER':
        return 'RETENER';
      case 'CESION_AUTORIA':
        return 'CEDER';
    }
  },
};

export const POLITICAS: Politica[] = [
  ESTRATEGA_COLECTIVO,
  PRAGMATICO,
  LIDER_MARTIR,
  OBSERVADOR_PASIVO,
];
