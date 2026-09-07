/**
 * El Cuartel del Colectivo (GDD seccion 10).
 * El lider arranca solo; los tres perfiles especializados se reclutan en juego.
 */

import { CAPACIDAD_HORAS_ALIADO, RECURSOS_INICIALES } from '../balance';
import type { MiembroColectivo } from '../types';

export const PLANTILLA_COLECTIVO: MiembroColectivo[] = [
  {
    id: 'lider',
    nombre: 'Tú (Coordinación General)',
    rol: 'LIDER',
    horasAsignadas: 0,
    activo: true,
    capacidadHoras: RECURSOS_INICIALES.horasBaseSemana,
    verboAsignado: null,
    costoFondos: 0,
    apoyoSocialMinimo: 0,
    especialidad:
      'Cada hora tuya sale de tu propia Resistencia. Eres el recurso más caro del colectivo.',
  },
  {
    id: 'mariana',
    nombre: 'Mariana Rendón',
    rol: 'ABOGADA',
    horasAsignadas: 0,
    activo: false,
    capacidadHoras: CAPACIDAD_HORAS_ALIADO,
    verboAsignado: null,
    costoFondos: 6_000,
    apoyoSocialMinimo: 20,
    especialidad:
      'Abogada pro-bono. Multiplica el rendimiento de Investigar/Redactar y detecta trampas en el articulado sin desgastarte.',
  },
  {
    id: 'mateo',
    nombre: 'Mateo Iriarte',
    rol: 'VOCERO',
    horasAsignadas: 0,
    activo: false,
    capacidadHoras: CAPACIDAD_HORAS_ALIADO,
    verboAsignado: null,
    costoFondos: 5_000,
    apoyoSocialMinimo: 25,
    especialidad:
      'Vocero comunitario. Convierte Apoyo Social en Presión mediática y contiene las campañas de guerra sucia.',
  },
  {
    id: 'lupita',
    nombre: 'Lupita Cruz',
    rol: 'ENLACE_BASE',
    horasAsignadas: 0,
    activo: false,
    capacidadHoras: CAPACIDAD_HORAS_ALIADO,
    verboAsignado: null,
    costoFondos: 4_000,
    apoyoSocialMinimo: 15,
    especialidad:
      'Enlace de base. Sostiene la moral en asambleas y amortigua las fisuras internas del movimiento.',
  },
];

export function plantillaColectivo(): MiembroColectivo[] {
  return structuredClone(PLANTILLA_COLECTIVO);
}
