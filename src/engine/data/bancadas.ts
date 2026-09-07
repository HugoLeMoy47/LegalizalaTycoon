/**
 * Catalogo de bancadas politicas (parodia institucional, GDD seccion 6).
 * Datos puros: la UI decide como pintarlos.
 */

import type { Partido } from '../types';

export interface FichaBancada {
  id: Partido;
  nombre: string;
  siglas: string;
  color: 'guinda' | 'azulpan' | 'tricolor' | 'verdepvem';
  perfil: string;
  /** Maña parlamentaria caracteristica, usada en textos de evento. */
  maña: string;
}

export const BANCADAS: Record<Partido, FichaBancada> = {
  DEFORMACION: {
    id: 'DEFORMACION',
    nombre: 'Movimiento de la Deformación',
    siglas: 'MDF',
    color: 'guinda',
    perfil:
      'Mayoría oficialista hegemónica. Discurso popular y mesiánico, disciplina vertical inflexible.',
    maña: 'Exige colgarse la medalla: o cedes la autoría, o el dictamen no se agenda.',
  },
  TRADICION_Y_ORDEN: {
    id: 'TRADICION_Y_ORDEN',
    nombre: 'Partido Tradición y Orden',
    siglas: 'PTO',
    color: 'azulpan',
    perfil: 'Bloque conservador y pro-empresarial. Alérgico a reformas progresistas.',
    maña: 'Pide un "estudio de impacto a la familia y la empresa" cada vez que puede.',
  },
  FRENTE_INSTITUCIONAL: {
    id: 'FRENTE_INSTITUCIONAL',
    nombre: 'Frente Institucional del Poder',
    siglas: 'FIP',
    color: 'tricolor',
    perfil: 'Viejos dinosaurios del régimen. Maestros absolutos de la trampa de procedimiento.',
    maña: 'Rompe el quórum yéndose a comer y cobra favores por votar en abstención.',
  },
  ECOLOGISTA: {
    id: 'ECOLOGISTA',
    nombre: 'Partido Ecologista Pragmático',
    siglas: 'PEP',
    color: 'verdepvem',
    perfil: 'Bancada satélite y mercenaria. Vende su voto al mejor postor presupuestal.',
    maña: 'Su voto tiene lista de precios; no negocia ideas, negocia partidas.',
  },
};

export const ORDEN_BANCADAS: Partido[] = [
  'DEFORMACION',
  'TRADICION_Y_ORDEN',
  'FRENTE_INSTITUCIONAL',
  'ECOLOGISTA',
];
