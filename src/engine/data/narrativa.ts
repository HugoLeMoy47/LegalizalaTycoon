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

/** Titulares de gaceta que dan color a la semana sin efecto mecanico. */
export const TITULARES_GACETA: Record<FaseJuego, string[]> = {
  MUNICIPAL: [
    'Cabildo aprueba por unanimidad la remodelación de la glorieta; el reglamento sigue en carpeta.',
    'Regidores piden "más análisis" antes de tocar el Bando de Policía y Gobierno.',
    'Colectivos vecinales instalan mesa informativa en el jardín principal.',
    'El presidente municipal se declara "abierto al diálogo" ante las cámaras.',
  ],
  ESTATAL: [
    'La Comisión de Salud agenda el punto y lo baja en la misma sesión.',
    'Editorial local: "¿Legislar sobre cannabis o legislar sobre miedo?".',
    'Diputados locales viajan a un foro de tres días sobre buenas prácticas parlamentarias.',
    'La gaceta publica el turno a comisiones con dos semanas de retraso.',
  ],
  FEDERAL: [
    'San Lázaro: la agenda del periodo se llena de reformas fiscales de última hora.',
    'El Senado anuncia parlamento abierto y lo programa a las 9:00 de un viernes.',
    'La Suprema Corte vuelve a recordar al Congreso su omisión legislativa.',
    'Columnistas apuestan a que el dictamen "duerme el sueño de los justos".',
  ],
};
