/**
 * Embudo legislativo de la causa emblematica de la POC:
 * Regulacion Integral del Cannabis en Mexico (Bitacora #007).
 *
 * Municipal -> Estatal -> Federal, con el Reloj de la Congeladora activandose
 * a partir de la fase estatal (GDD seccion 5).
 */

import {
  RELOJ_CONGELADORA_ESTANDAR,
  RELOJ_CONGELADORA_MUNICIPAL,
  SEMANAS_COMISION_PRESUPUESTO,
  SEMANAS_PARLAMENTO_ABIERTO,
} from '../balance';
import type { Comision, FaseJuego, Legislador, Partido, Postura } from '../types';

/**
 * Campos de tramite que la v2.2 anadio a `Comision`. Casi todas las etapas son
 * dictaminadoras clasicas, asi que se declaran por defecto y solo las etapas
 * nuevas los sobrescriben.
 */
const DICTAMINADORA = {
  tipo: 'DICTAMINADORA',
  semanasTramite: 0,
  semanasTramiteCumplidas: 0,
  apoyoSocialRequerido: 0,
  seOmiteSiMutilada: false,
} satisfies Pick<
  Comision,
  'tipo' | 'semanasTramite' | 'semanasTramiteCumplidas' | 'apoyoSocialRequerido' | 'seOmiteSiMutilada'
>;

interface SemillaLegislador {
  nombre: string;
  partido: Partido;
  postura: Postura;
  costoCabildeo: number;
  precioVotoFondos?: number;
  esCoordinador?: boolean;
}

function construirLegisladores(prefijo: string, semillas: SemillaLegislador[]): Legislador[] {
  return semillas.map((semilla, indice) => ({
    id: `${prefijo}-${indice + 1}`,
    nombre: semilla.nombre,
    partido: semilla.partido,
    postura: semilla.postura,
    costoCabildeo: semilla.costoCabildeo,
    ...(semilla.precioVotoFondos !== undefined
      ? { precioVotoFondos: semilla.precioVotoFondos }
      : {}),
    ...(semilla.esCoordinador ? { esCoordinador: true } : {}),
  }));
}

// ---------------------------------------------------------------------------
// Fase 1 — Cabildo Municipal (Semanas 1-30)
// ---------------------------------------------------------------------------

const COMISION_GOBERNACION: Comision = {
  id: 'com-gobernacion',
  ...DICTAMINADORA,
  nombre: 'Comisión de Gobernación y Reglamentos',
  fase: 'MUNICIPAL',
  // El reloj arranca hasta la semana 6, cuando Oficialia de Partes valida la
  // iniciativa (GUIA v2.0 seccion 5.B, Etapa C).
  relojCongeladoraSemanas: RELOJ_CONGELADORA_MUNICIPAL,
  relojInicial: RELOJ_CONGELADORA_MUNICIPAL,
  // v2.2: 5 de 7 y no 4. La instancia municipal tenia que ocupar su fase, no
  // resolverse en dos turnos (Bitacora #014 seccion 3.C.4).
  votosFavorRequeridos: 5,
  dictamenAprobado: false,
  congelada: false,
  solidezTecnicaRequerida: 35,
  presionPlenoRequerida: 25,
  nodoId: 'com-gobernacion',
  nodoPlenoId: 'pleno-cabildo',
  esUltimaInstancia: false,
  legisladores: construirLegisladores('reg', [
    {
      nombre: 'Reg. Ofelia Carrasco',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 10,
      esCoordinador: true,
    },
    { nombre: 'Reg. Bruno Peralta', partido: 'DEFORMACION', postura: 'INDECISO', costoCabildeo: 9 },
    {
      nombre: 'Reg. Estela Naranjo',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 18,
    },
    {
      nombre: 'Reg. Jacinto Rueda',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'OPOSITOR',
      costoCabildeo: 16,
    },
    {
      nombre: 'Reg. Marisol Tapia',
      partido: 'ECOLOGISTA',
      postura: 'INDECISO',
      costoCabildeo: 8,
      precioVotoFondos: 6_000,
    },
    { nombre: 'Reg. Aurora Benítez', partido: 'DEFORMACION', postura: 'FAVOR', costoCabildeo: 6 },
    {
      nombre: 'Sínd. Fermín Aguilar',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 20,
    },
  ]),
};

// ---------------------------------------------------------------------------
// Fase 2 — Congreso del Estado (Semanas 31-65)
// ---------------------------------------------------------------------------

const COMISION_SALUD_ESTATAL: Comision = {
  id: 'com-salud',
  ...DICTAMINADORA,
  nombre: 'Comisión de Salud (Congreso del Estado)',
  fase: 'ESTATAL',
  relojCongeladoraSemanas: RELOJ_CONGELADORA_ESTANDAR,
  relojInicial: RELOJ_CONGELADORA_ESTANDAR,
  votosFavorRequeridos: 5,
  dictamenAprobado: false,
  congelada: false,
  solidezTecnicaRequerida: 50,
  presionPlenoRequerida: 50,
  nodoId: 'com-salud',
  nodoPlenoId: 'pleno-congreso',
  esUltimaInstancia: false,
  legisladores: construirLegisladores('dipl', [
    {
      nombre: 'Dip. Renata Olmedo',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 14,
      esCoordinador: true,
    },
    { nombre: 'Dip. Ismael Cordero', partido: 'DEFORMACION', postura: 'INDECISO', costoCabildeo: 13 },
    { nombre: 'Dip. Paloma Rentería', partido: 'DEFORMACION', postura: 'FAVOR', costoCabildeo: 8 },
    {
      nombre: 'Dip. Cuauhtémoc Lira',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 24,
    },
    {
      nombre: 'Dip. Genoveva Prado',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 22,
    },
    {
      nombre: 'Dip. Aristeo Valdés',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'OPOSITOR',
      costoCabildeo: 20,
    },
    {
      nombre: 'Dip. Hortensia Bañuelos',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'INDECISO',
      costoCabildeo: 16,
    },
    {
      nombre: 'Dip. Rubén Villaseñor',
      partido: 'ECOLOGISTA',
      postura: 'INDECISO',
      costoCabildeo: 11,
      precioVotoFondos: 9_000,
    },
    {
      nombre: 'Dip. Xóchitl Arreola',
      partido: 'ECOLOGISTA',
      postura: 'OPOSITOR',
      costoCabildeo: 15,
      precioVotoFondos: 12_000,
    },
  ]),
};

const COMISION_JUSTICIA_ESTATAL: Comision = {
  id: 'com-justicia',
  ...DICTAMINADORA,
  nombre: 'Comisión de Justicia y Derechos Humanos',
  fase: 'ESTATAL',
  relojCongeladoraSemanas: RELOJ_CONGELADORA_ESTANDAR,
  relojInicial: RELOJ_CONGELADORA_ESTANDAR,
  votosFavorRequeridos: 5,
  dictamenAprobado: false,
  congelada: false,
  solidezTecnicaRequerida: 58,
  presionPlenoRequerida: 50,
  nodoId: 'com-justicia',
  nodoPlenoId: 'pleno-congreso',
  esUltimaInstancia: false,
  legisladores: construirLegisladores('dipj', [
    {
      nombre: 'Dip. Nicolás Zepeda',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 15,
      esCoordinador: true,
    },
    { nombre: 'Dip. Amparo Solís', partido: 'DEFORMACION', postura: 'INDECISO', costoCabildeo: 14 },
    {
      nombre: 'Dip. Teodoro Manríquez',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 26,
    },
    {
      nombre: 'Dip. Verónica Escalante',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 23,
    },
    {
      nombre: 'Dip. Baltazar Quiroz',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'OPOSITOR',
      costoCabildeo: 21,
    },
    {
      nombre: 'Dip. Leticia Fonseca',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'INDECISO',
      costoCabildeo: 17,
    },
    { nombre: 'Dip. Emiliano Cázares', partido: 'DEFORMACION', postura: 'FAVOR', costoCabildeo: 9 },
    {
      nombre: 'Dip. Rosalba Ibarra',
      partido: 'ECOLOGISTA',
      postura: 'INDECISO',
      costoCabildeo: 12,
      precioVotoFondos: 10_000,
    },
    {
      nombre: 'Dip. Serafín Montiel',
      partido: 'ECOLOGISTA',
      postura: 'OPOSITOR',
      costoCabildeo: 16,
      precioVotoFondos: 14_000,
    },
  ]),
};

// ---------------------------------------------------------------------------
// Fase 3 — Congreso de la Union (Semanas 66-100), sistema bicameral
// ---------------------------------------------------------------------------

const COMISIONES_UNIDAS_DIPUTADOS: Comision = {
  id: 'com-unidas',
  ...DICTAMINADORA,
  nombre: 'Comisiones Unidas de Salud y Justicia (Diputados)',
  fase: 'FEDERAL',
  relojCongeladoraSemanas: RELOJ_CONGELADORA_ESTANDAR,
  relojInicial: RELOJ_CONGELADORA_ESTANDAR,
  // 65% de 11 curules = 7.15 -> 8 votos (umbral de mayoria calificada, GDD 12).
  votosFavorRequeridos: 8,
  dictamenAprobado: false,
  congelada: false,
  solidezTecnicaRequerida: 70,
  presionPlenoRequerida: 65,
  nodoId: 'com-unidas',
  nodoPlenoId: 'pleno-diputados',
  esUltimaInstancia: false,
  legisladores: construirLegisladores('fed', [
    {
      nombre: 'Dip. Fed. Aureliano Bustos',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 18,
      esCoordinador: true,
    },
    {
      nombre: 'Dip. Fed. Coral Mendizábal',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 17,
    },
    {
      nombre: 'Dip. Fed. Práxedes Rojo',
      partido: 'DEFORMACION',
      postura: 'FAVOR',
      costoCabildeo: 10,
    },
    {
      nombre: 'Dip. Fed. Gonzalo Iturbe',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 19,
    },
    {
      nombre: 'Dip. Fed. Remedios Alcántara',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 30,
    },
    {
      nombre: 'Dip. Fed. Cipriano Lerma',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 28,
    },
    {
      nombre: 'Dip. Fed. Nieves Portillo',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'INDECISO',
      costoCabildeo: 24,
    },
    {
      nombre: 'Dip. Fed. Anastasio Camarena',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'OPOSITOR',
      costoCabildeo: 26,
    },
    {
      nombre: 'Dip. Fed. Ofelia Sandoval',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'INDECISO',
      costoCabildeo: 21,
    },
    {
      nombre: 'Dip. Fed. Ulises Berrones',
      partido: 'ECOLOGISTA',
      postura: 'INDECISO',
      costoCabildeo: 14,
      precioVotoFondos: 18_000,
    },
    {
      nombre: 'Dip. Fed. Débora Anzures',
      partido: 'ECOLOGISTA',
      postura: 'OPOSITOR',
      costoCabildeo: 19,
      precioVotoFondos: 24_000,
    },
  ]),
};

const COMISION_SENADO: Comision = {
  id: 'com-senado',
  ...DICTAMINADORA,
  nombre: 'Comisión de Justicia (Senado · Cámara Revisora)',
  fase: 'FEDERAL',
  relojCongeladoraSemanas: RELOJ_CONGELADORA_ESTANDAR,
  relojInicial: RELOJ_CONGELADORA_ESTANDAR,
  // 65% de 9 escaños = 5.85 -> 6 votos.
  votosFavorRequeridos: 6,
  dictamenAprobado: false,
  congelada: false,
  solidezTecnicaRequerida: 78,
  presionPlenoRequerida: 70,
  nodoId: 'com-senado',
  nodoPlenoId: 'pleno-senado',
  esUltimaInstancia: true,
  legisladores: construirLegisladores('sen', [
    {
      nombre: 'Sen. Herlinda Vázquez',
      partido: 'DEFORMACION',
      postura: 'INDECISO',
      costoCabildeo: 20,
      esCoordinador: true,
    },
    { nombre: 'Sen. Ignacio Berumen', partido: 'DEFORMACION', postura: 'INDECISO', costoCabildeo: 19 },
    { nombre: 'Sen. Zoraida Padilla', partido: 'DEFORMACION', postura: 'FAVOR', costoCabildeo: 11 },
    {
      nombre: 'Sen. Fulgencio Ayala',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 32,
    },
    {
      nombre: 'Sen. Brígida Sepúlveda',
      partido: 'TRADICION_Y_ORDEN',
      postura: 'OPOSITOR',
      costoCabildeo: 29,
    },
    {
      nombre: 'Sen. Onésimo Gálvez',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'OPOSITOR',
      costoCabildeo: 27,
    },
    {
      nombre: 'Sen. Casilda Moreno',
      partido: 'FRENTE_INSTITUCIONAL',
      postura: 'INDECISO',
      costoCabildeo: 22,
    },
    {
      nombre: 'Sen. Tiburcio Landa',
      partido: 'ECOLOGISTA',
      postura: 'INDECISO',
      costoCabildeo: 15,
      precioVotoFondos: 20_000,
    },
    {
      nombre: 'Sen. Yolanda Cifuentes',
      partido: 'ECOLOGISTA',
      postura: 'OPOSITOR',
      costoCabildeo: 21,
      precioVotoFondos: 26_000,
    },
  ]),
};

// ---------------------------------------------------------------------------
// Etapas de tramite (GUIA v2.2 seccion 4.1 — "el embudo se estira")
// ---------------------------------------------------------------------------
//
// Ni el Foro de Parlamento Abierto ni la opinion de Hacienda votan: consumen
// calendario. Son cuellos de botella reales del proceso legislativo mexicano y
// aqui cumplen ademas una funcion de ritmo — sin ellos, la instancia municipal
// se resolvia en dos semanas y dejaba 23 vacias (Bitacora #014).

/** Foro de consulta obligatorio entre el dictamen y el Pleno. */
function parlamentoAbierto(
  id: string,
  nombre: string,
  fase: FaseJuego,
  nodoId: string,
  nodoPlenoId: string,
  apoyoSocialRequerido: number,
): Comision {
  return {
    ...DICTAMINADORA,
    tipo: 'PARLAMENTO_ABIERTO',
    semanasTramite: SEMANAS_PARLAMENTO_ABIERTO[fase],
    apoyoSocialRequerido,
    // Un foro no se congela por durar lo que dura, sino por no poder
    // celebrarse: el reloj cubre las sesiones programadas mas el margen
    // reglamentario estandar.
    relojCongeladoraSemanas: SEMANAS_PARLAMENTO_ABIERTO[fase] + RELOJ_CONGELADORA_ESTANDAR,
    relojInicial: SEMANAS_PARLAMENTO_ABIERTO[fase] + RELOJ_CONGELADORA_ESTANDAR,
    id,
    nombre,
    fase,
    votosFavorRequeridos: 0,
    dictamenAprobado: false,
    congelada: false,
    solidezTecnicaRequerida: 0,
    presionPlenoRequerida: 0,
    nodoId,
    nodoPlenoId,
    esUltimaInstancia: false,
    legisladores: [],
  };
}

/**
 * Opinion de la Comision de Presupuesto.
 *
 * Solo existe si la ley conserva su presupuesto: mutilarla te ahorra una
 * comision entera. Es un incentivo perverso deliberado (Bitacora #014, riesgo
 * 4) — asi opera el chantaje presupuestal real.
 */
function comisionPresupuesto(
  id: string,
  nombre: string,
  fase: FaseJuego,
  nodoId: string,
  nodoPlenoId: string,
  solidezTecnicaRequerida: number,
): Comision {
  return {
    ...DICTAMINADORA,
    tipo: 'PRESUPUESTO',
    semanasTramite: SEMANAS_COMISION_PRESUPUESTO[fase],
    seOmiteSiMutilada: true,
    relojCongeladoraSemanas: SEMANAS_COMISION_PRESUPUESTO[fase] + RELOJ_CONGELADORA_ESTANDAR,
    relojInicial: SEMANAS_COMISION_PRESUPUESTO[fase] + RELOJ_CONGELADORA_ESTANDAR,
    id,
    nombre,
    fase,
    votosFavorRequeridos: 0,
    dictamenAprobado: false,
    congelada: false,
    solidezTecnicaRequerida,
    presionPlenoRequerida: 0,
    nodoId,
    nodoPlenoId,
    esUltimaInstancia: false,
    legisladores: [],
  };
}

const FORO_MUNICIPAL = parlamentoAbierto(
  'foro-municipal',
  'Foro de Consulta Vecinal (Parlamento Abierto)',
  'MUNICIPAL',
  'foro-municipal',
  'pleno-cabildo',
  35,
);

const PRESUPUESTO_MUNICIPAL = comisionPresupuesto(
  'presupuesto-municipal',
  'Comisión de Hacienda Municipal',
  'MUNICIPAL',
  'presupuesto-municipal',
  'pleno-cabildo',
  40,
);

const FORO_ESTATAL = parlamentoAbierto(
  'foro-estatal',
  'Parlamento Abierto del Congreso del Estado',
  'ESTATAL',
  'foro-estatal',
  'pleno-congreso',
  45,
);

const PRESUPUESTO_ESTATAL = comisionPresupuesto(
  'presupuesto-estatal',
  'Comisión de Hacienda y Presupuesto (Estado)',
  'ESTATAL',
  'presupuesto-estatal',
  'pleno-congreso',
  55,
);

/** Comisiones por fase, en orden estricto de embudo. */
export const COMISIONES_POR_FASE: Record<FaseJuego, Comision[]> = {
  MUNICIPAL: [COMISION_GOBERNACION, FORO_MUNICIPAL, PRESUPUESTO_MUNICIPAL],
  ESTATAL: [
    COMISION_SALUD_ESTATAL,
    COMISION_JUSTICIA_ESTATAL,
    FORO_ESTATAL,
    PRESUPUESTO_ESTATAL,
  ],
  // La fase federal conserva su embudo: ya ocupa su calendario completo y es
  // la unica con dos camaras. Estirarla mas empujaba la promulgacion despues
  // de la semana 100 (medido con `npm run sim`).
  FEDERAL: [COMISIONES_UNIDAS_DIPUTADOS, COMISION_SENADO],
};

/** Copia profunda para no compartir referencias entre partidas. */
export function comisionesDeFase(fase: FaseJuego): Comision[] {
  return structuredClone(COMISIONES_POR_FASE[fase]);
}
