/**
 * Textos narrativos del motor: pensamientos intrusivos de la Niebla Mental
 * (GDD seccion 9 y 11) y cartas del Event Deck (GDD seccion 13).
 *
 * Se guardan aqui, no en la UI, porque las cartas tienen efectos mecanicos y
 * deben ser deterministas bajo una misma semilla.
 */

import type { FaseJuego } from '../types';

/**
 * Distorsiones cognitivas que flotan en los margenes del War Room cuando la
 * Resistencia cae por debajo del 30%. Son ejemplos de catastrofismo y falso
 * locus de control: el juego los muestra para que el jugador los reconozca.
 */
export const PENSAMIENTOS_INTRUSIVOS: string[] = [
  'No puedes descansar.',
  'Te van a madrugar.',
  'Todo depende de ti.',
  'Si paras, te van a olvidar.',
  'Nadie más puede hacerlo.',
  'Nadie más se compromete.',
  'Te van a traicionar.',
  'Si descansas este fin de semana, la causa se derrumba.',
  'Ya llegaste hasta aquí, aguántate.',
  'La gente confió en ti y la vas a defraudar.',
];

/** Etiqueta pedagogica de la distorsion, para el modulo de TCC. */
export const ETIQUETAS_DISTORSION: Record<string, string> = {
  'No puedes descansar.': 'Deber tiránico',
  'Te van a madrugar.': 'Catastrofismo',
  'Todo depende de ti.': 'Falso locus de control',
  'Si paras, te van a olvidar.': 'Catastrofismo',
  'Nadie más puede hacerlo.': 'Falso locus de control',
  'Nadie más se compromete.': 'Generalización excesiva',
  'Te van a traicionar.': 'Lectura de mente',
  'Si descansas este fin de semana, la causa se derrumba.': 'Catastrofismo',
  'Ya llegaste hasta aquí, aguántate.': 'Falacia de la recompensa divina',
  'La gente confió en ti y la vas a defraudar.': 'Culpa desplazada',
};

// ---------------------------------------------------------------------------
// Event Deck
// ---------------------------------------------------------------------------

export type IdCartaEvento =
  | 'DIPUTADO_CHAPULIN'
  | 'MADRUGUETE'
  | 'COOPTACION'
  | 'QUORUM_BANQUETE'
  | 'CORTINA_DE_HUMO';

export interface CartaEvento {
  id: IdCartaEvento;
  titulo: string;
  texto: string;
  /** Fases en las que la carta puede salir. */
  fases: FaseJuego[];
  /** Requiere que haya una comision activa para tener sentido. */
  requiereComision: boolean;
  /** Abre un modal de decision en lugar de resolverse sola. */
  esDecision: boolean;
}

export const EVENT_DECK: CartaEvento[] = [
  {
    id: 'DIPUTADO_CHAPULIN',
    titulo: 'El Diputado Chapulín',
    texto:
      'El presidente de la comisión pidió licencia para buscar una alcaldía. Se reinstala la mesa y el dictamen se retrasa tres semanas.',
    fases: ['ESTATAL', 'FEDERAL'],
    requiereComision: true,
    esDecision: false,
  },
  {
    id: 'MADRUGUETE',
    titulo: 'El Madruguete de las 3:00 AM',
    texto:
      'Convocan sesión extraordinaria de madrugada para colar un dictamen en contra. Movilizar observadores cívicos a esa hora cuesta caro.',
    fases: ['ESTATAL', 'FEDERAL'],
    requiereComision: true,
    esDecision: false,
  },
  {
    id: 'COOPTACION',
    titulo: 'Cooptación de Liderazgo',
    texto:
      'El Movimiento de la Deformación ofrece una dirección general con sueldo y camioneta a una pieza clave de tu colectivo.',
    fases: ['ESTATAL', 'FEDERAL'],
    requiereComision: false,
    esDecision: true,
  },
  {
    id: 'QUORUM_BANQUETE',
    titulo: 'Falta de Quórum por Banquete',
    texto:
      'La oposición abandonó la sala rumbo a una comida de tres horas. Se cae la sesión y la semana se pierde.',
    fases: ['MUNICIPAL', 'ESTATAL', 'FEDERAL'],
    requiereComision: true,
    esDecision: false,
  },
  {
    id: 'CORTINA_DE_HUMO',
    titulo: 'La Cortina de Humo Nacional',
    texto:
      'Un escándalo nacional absorbe toda la atención mediática. Tu presión política se evapora de las mesas de redacción.',
    fases: ['ESTATAL', 'FEDERAL'],
    requiereComision: false,
    esDecision: false,
  },
];

// ---------------------------------------------------------------------------
// Gaceta Semanal — retorica de medios (GUIA v2.0 seccion 4.B)
// ---------------------------------------------------------------------------

/** Cabeceras ficticias que "publican" los titulares. */
export const MEDIOS_FICTICIOS: string[] = [
  'El Heraldo de Provincia',
  'La Jornada Municipal',
  'Reforma Local · Sección Política',
  'Boletín de la Gaceta Parlamentaria',
  'El Universal del Estado',
];

/**
 * Catalogo de titulares satiricos por fase. Sin efecto mecanico: son retorica
 * de medios, el folclor de la politica mexicana que enmarca lo que el jugador
 * acaba de hacer.
 */
export const TITULARES_GACETA: Record<FaseJuego, string[]> = {
  MUNICIPAL: [
    'Regidores del Cabildo solicitan receso de 3 horas para desayunar barbacoa en sesión clave.',
    'Policía municipal asegura medio cigarrillo artesanal en parque público y lo reporta como "desarticulación de punto de distribución".',
    'Comerciantes locales muestran simpatía con el colectivo ciudadano tras hartazgo por cobro de piso policial.',
    'El Presidente Municipal declara que "la moral de las familias no se negocia" antes de revisar el borrador de la iniciativa.',
    'Cabildo aprueba por unanimidad la remodelación de la glorieta; el reglamento sigue en carpeta.',
    'Regidores piden "más análisis" antes de tocar el Bando de Policía y Gobierno.',
  ],
  ESTATAL: [
    'Diputado del Movimiento de la Deformación se queda dormido en votación de comisión; su asesor levanta la mano por él.',
    'Bancada de Tradición y Orden exige estudios teológicos y de impacto familiar antes de dictaminar.',
    'Granja de bots gubernamentales satura redes del colectivo con acusaciones de financiamiento extranjero.',
    'Comisión de Puntos Constitucionales convoca a "Foro de Parlamento Abierto" pero solo invita a ponentes afines al oficialismo.',
    'La Comisión de Salud agenda el punto y lo baja en la misma sesión.',
    'La gaceta publica el turno a comisiones con dos semanas de retraso.',
  ],
  FEDERAL: [
    'Senadores del Frente Institucional negocian el dictamen en restaurante de cortes caros de Polanco.',
    'El Partido Ecologista anuncia que votará a favor… si se añade un subsidio de hidroponía para sus empresas familiares.',
    'Mesa Directiva de San Lázaro aplica "chicanada parlamentaria" y congela el dictamen en el último minuto de la sesión.',
    'Diario Oficial de la Federación publica fe de erratas que misteriosamente omitía el artículo de despenalización.',
    'El Senado anuncia parlamento abierto y lo programa a las 9:00 de un viernes.',
    'La Suprema Corte vuelve a recordar al Congreso su omisión legislativa.',
  ],
};

// ---------------------------------------------------------------------------
// Tarjetas informativas contextuales (GUIA v2.0 seccion 4.C)
// ---------------------------------------------------------------------------

/** Descripcion breve de cada bancada, para el tooltip de las tarjetas. */
export const TOOLTIP_BANCADA: Record<string, string> = {
  DEFORMACION: 'Mayoría oficialista. Si la iniciativa no la propuso el líder moral, no existe.',
  TRADICION_Y_ORDEN: 'Conservadurismo doctrinario. Todo cambio es una amenaza civilizatoria.',
  FRENTE_INSTITUCIONAL:
    'Dinosaurios del trámite. Te congelan la ley con una sonrisa y una cita al reglamento de 1934.',
  ECOLOGISTA: 'Votos en renta. Buscan concesiones comerciales o presupuesto satélite.',
};

/** Glosario parlamentario para los tooltips de conceptos. */
export const GLOSARIO: Record<string, string> = {
  CONGELADORA:
    'Práctica no oficial donde una comisión deja vencer los plazos de dictaminación para desechar la ley sin votar en contra.',
  OFICIALIA_DE_PARTES:
    'Ventanilla burocrática obligatoria para registrar formalmente documentos ante el Poder Legislativo.',
  DICTAMEN:
    'Resolución que una comisión emite sobre una iniciativa. Sin dictamen, el asunto no puede llegar al Pleno.',
  PLENO:
    'Sesión de todas y todos los legisladores. Aquí se vota el dictamen que la comisión ya aprobó.',
  QUORUM:
    'Número mínimo de legisladores presentes para que la sesión sea válida. Romperlo a propósito es una táctica de bloqueo.',
  SOLIDEZ_TECNICA:
    'Calidad jurídica de tu articulado. Si no alcanza el mínimo de la comisión, te devuelven el dictamen aunque tengas los votos.',
  FIRMAS:
    'El Art. 71 frac. IV exige respaldo ciudadano verificable antes de que una iniciativa pueda presentarse formalmente.',
  PARLAMENTO_ABIERTO:
    'Foro de consulta pública que la comisión debe celebrar antes de mandar el dictamen al Pleno. Aquí no se votan artículos: se agotan sesiones. Si nadie llega, el foro no cuenta y el reloj sigue corriendo.',
  COMISION_PRESUPUESTO:
    'Opinión de Hacienda sobre cuánto cuesta aplicar la ley. Solo se exige si la ley trae presupuesto asignado: quitárselo te ahorra el trámite completo, y ese es exactamente el chantaje.',
  ORDEN_DEL_DIA:
    'Lista de asuntos que la Mesa Directiva sube a tribuna en cada sesión. Tener el dictamen aprobado no es tener la votación: el punto se cae de la sesión más veces de las que se agenda.',
  RECESO:
    'Periodo en el que las cámaras no sesionan. Ningún plazo de dictaminación corre, así que es el único tramo de la partida en el que el tiempo no juega en tu contra.',
};

// ---------------------------------------------------------------------------
// Prologo narrativo — El Incidente Incitador (GUIA v2.0 seccion 2)
// ---------------------------------------------------------------------------

export const PROLOGO = {
  expediente: 'EXP-2026/089-CDMX',
  estado: 'CASO ACTIVO / RETENCIÓN ILEGAL',
  hechos:
    'Anoche, elementos de la policía municipal interceptaron a Gael, un joven estudiante de 21 años de tu comunidad, portando 6 gramos de cannabis para uso personal.',
  extorsion:
    'Exigen una mordida de $25,000 MXN para no turnarlo al Ministerio Público bajo cargos de narcomenudeo con prisión preventiva oficiosa. La familia está desesperada.',
  epifania:
    'Pagar fianzas o manifestarse un fin de semana ya no es suficiente. Mañana detendrán a alguien más. La única forma de frenar la extorsión institucional es cambiar la ley desde su raíz.',
  mandato:
    'Activarás el mecanismo del ARTÍCULO 71 FRACCIÓN IV CONSTITUCIONAL: presentar una INICIATIVA CIUDADANA para regular integralmente la causa.',
  reloj:
    'Cuentas con una legislatura estricta de 100 SEMANAS. Si no logras la promulgación en el Diario Oficial de la Federación antes de que termine el periodo, la iniciativa morirá en la "Congeladora" y todo el esfuerzo será borrado.',
  pregunta: '¿Cuidarás a tu gente y tu salud mental, o te devorará el sistema?',
  boton: 'Asumir el mandato',
} as const;
