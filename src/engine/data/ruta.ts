/**
 * Ruta parlamentaria completa de la iniciativa (vista Mapa de Nodos, GUIA 5.2).
 *
 *   Mesa Directiva -> Comision(es) Dictaminadora(s) -> Pleno -> ... -> DOF
 */

import type { NodoRuta } from '../types';

export const RUTA_LEGISLATIVA: NodoRuta[] = [
  // Fase 1 — Municipal
  {
    id: 'mesa-municipal',
    etiqueta: 'Mesa Directiva del Cabildo',
    fase: 'MUNICIPAL',
    tipo: 'MESA',
    estado: 'ACTIVO',
  },
  {
    id: 'com-gobernacion',
    etiqueta: 'Comisión de Gobernación',
    fase: 'MUNICIPAL',
    tipo: 'COMISION',
    estado: 'PENDIENTE',
  },
  {
    id: 'pleno-cabildo',
    etiqueta: 'Pleno del Cabildo',
    fase: 'MUNICIPAL',
    tipo: 'PLENO',
    estado: 'PENDIENTE',
  },

  // Fase 2 — Estatal
  {
    id: 'mesa-estatal',
    etiqueta: 'Mesa Directiva · Congreso Local',
    fase: 'ESTATAL',
    tipo: 'MESA',
    estado: 'PENDIENTE',
  },
  {
    id: 'com-salud',
    etiqueta: 'Comisión de Salud',
    fase: 'ESTATAL',
    tipo: 'COMISION',
    estado: 'PENDIENTE',
  },
  {
    id: 'com-justicia',
    etiqueta: 'Comisión de Justicia y DH',
    fase: 'ESTATAL',
    tipo: 'COMISION',
    estado: 'PENDIENTE',
  },
  {
    id: 'pleno-congreso',
    etiqueta: 'Pleno del Congreso del Estado',
    fase: 'ESTATAL',
    tipo: 'PLENO',
    estado: 'PENDIENTE',
  },

  // Fase 3 — Federal (bicameral)
  {
    id: 'mesa-federal',
    etiqueta: 'Mesa Directiva · San Lázaro',
    fase: 'FEDERAL',
    tipo: 'MESA',
    estado: 'PENDIENTE',
  },
  {
    id: 'com-unidas',
    etiqueta: 'Comisiones Unidas Salud y Justicia',
    fase: 'FEDERAL',
    tipo: 'COMISION',
    estado: 'PENDIENTE',
  },
  {
    id: 'pleno-diputados',
    etiqueta: 'Pleno de Diputados (Origen)',
    fase: 'FEDERAL',
    tipo: 'PLENO',
    estado: 'PENDIENTE',
  },
  {
    id: 'com-senado',
    etiqueta: 'Comisión de Justicia · Senado',
    fase: 'FEDERAL',
    tipo: 'COMISION',
    estado: 'PENDIENTE',
  },
  {
    id: 'pleno-senado',
    etiqueta: 'Pleno del Senado (Revisora)',
    fase: 'FEDERAL',
    tipo: 'PLENO',
    estado: 'PENDIENTE',
  },
  {
    id: 'dof',
    etiqueta: 'Publicación en el DOF',
    fase: 'FEDERAL',
    tipo: 'PROMULGACION',
    estado: 'PENDIENTE',
  },
];

export function rutaLegislativaInicial(): NodoRuta[] {
  return structuredClone(RUTA_LEGISLATIVA);
}

/** Nodo Mesa Directiva que se sella al abrir cada fase. */
export const MESA_POR_FASE = {
  MUNICIPAL: 'mesa-municipal',
  ESTATAL: 'mesa-estatal',
  FEDERAL: 'mesa-federal',
} as const;
