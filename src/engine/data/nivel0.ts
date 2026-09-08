/**
 * NIVEL 0 — "El Rescate de Gael" (GUIA v2.2 sección 2).
 *
 * Guion del Chat de Red Vecinal de Alerta. Vive en el motor y no en la UI
 * porque cada opción tiene efectos mecánicos sobre los recursos y porque la
 * secuencia debe ser reproducible bajo una misma semilla.
 *
 * Los tres micro-pasos enseñan, a escala de una noche, los tres recursos que
 * la partida de 100 semanas administra: Solidez Técnica (documentar), Apoyo
 * Social (movilizar) y Presión Política (escalar institucionalmente).
 */

import type { MensajeChat, PasoNivel0 } from '../types';

export const GRUPO_NIVEL_0 = {
  nombre: 'Seguridad Comunitaria',
  descripcion: 'Red Vecinal de Alerta',
  participantes: 'Doña Elena · Tú · 42 vecinos',
} as const;

const ELENA = { autor: 'Doña Elena', avatar: '👵' };
const GAEL = { autor: 'Gael', avatar: '🧢' };
const VECINO = { autor: 'Don Chuy (tienda)', avatar: '🧔' };
const ABOGADA = { autor: 'Mariana R. (abogada)', avatar: '⚖️' };

export const PASOS_NIVEL_0: PasoNivel0[] = [
  // -------------------------------------------------------------------------
  // Paso 1 — Documentación jurídica (enseña Solidez Técnica)
  // -------------------------------------------------------------------------
  {
    numero: 1,
    leccion: 'Solidez Técnica',
    situacion: 'La patrulla exige dinero antes de llegar al Ministerio Público.',
    apertura: [
      {
        ...ELENA,
        texto:
          '¡URGENTE VECINOS! Se acaban de llevar a Gael en la patrulla MX-042 afuera del parque. 😭',
      },
      {
        ...ELENA,
        texto:
          'Le sembraron 6 gramos de mota y dicen que si no les damos $25,000 ahorita mismo, lo refunden en el penal por narcomenudeo. ¡Ayúdenme por favor!',
      },
      {
        ...VECINO,
        texto: 'Yo puedo poner tres mil, pero no tengo más. ¿Qué hacemos?',
      },
    ],
    opciones: [
      {
        id: 'IPH',
        etiqueta: 'Exigir el IPH y el número de patrulla',
        mensaje:
          'Doña Elena, NO suelte dinero. Pida número de placa y de patrulla, y exija que lo trasladen al Ministerio Público de inmediato con su Informe Policial Homologado.',
        civica: true,
        efectos: { solidezTecnica: 15, presionPolitica: 10 },
        respuesta: [
          {
            ...ELENA,
            texto:
              'Se lo dije tal cual y se pusieron nerviosos. Ya me dieron el número de patrulla. Dicen que lo llevan al MP.',
          },
          {
            ...ABOGADA,
            texto:
              'Perfecto. En cuanto existe un IPH con folio, la extorsión en la calle deja de funcionar: ya hay papel que amarra a los agentes.',
          },
          {
            autor: 'Red Vecinal',
            avatar: '📋',
            esNota: true,
            texto:
              'Documentar es la primera arma. Lo mismo hace la Solidez Técnica en el Congreso: sin papel que aguante revisión, tu iniciativa se cae aunque tengas los votos.',
          },
        ],
      },
      {
        id: 'MORDIDA',
        etiqueta: 'Juntar la mordida entre todos',
        mensaje: 'Doña Elena, mejor consiga lo que pueda antes de que le hagan daño…',
        civica: false,
        reprimenda:
          'Pagar la mordida condena a Gael y engorda la caja chica de la corrupción: sin IPH no hay expediente, y sin expediente lo pueden volver a levantar mañana. Sé el defensor legal que necesita.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Paso 2 — Movilización vecinal (enseña Apoyo Social)
  // -------------------------------------------------------------------------
  {
    numero: 2,
    leccion: 'Apoyo Social',
    situacion: 'Gael está incomunicado en las galeras del MP y nadie da informes.',
    apertura: [
      {
        ...ELENA,
        texto:
          'Ya estoy en el MP. El comandante de guardia no me deja verlo ni me dice de qué lo acusan. Son las 11 de la noche.',
      },
      {
        ...ABOGADA,
        texto: 'Voy en camino, pero tardo 40 minutos. No lo dejen solo.',
      },
    ],
    opciones: [
      {
        id: 'ALERTA',
        etiqueta: 'Alerta comunitaria y presencia física',
        mensaje:
          'VECINOS: quien pueda, al Ministerio Público AHORA. Lleven cartulinas y teléfonos grabando. Vamos a transmitir en vivo.',
        civica: true,
        efectos: { apoyoSocial: 20 },
        respuesta: [
          {
            ...VECINO,
            texto: 'Ya vamos como treinta. Traigo la camioneta con la bocina.',
          },
          {
            ...ELENA,
            texto:
              'Se les acabó la calma. Salió el comandante a preguntar quién está grabando. 📱',
          },
          {
            autor: 'Red Vecinal',
            avatar: '📢',
            esNota: true,
            texto:
              'Treinta personas con cámaras encendidas cambian el cálculo de riesgo de una autoridad. Eso es Apoyo Social: gente dispuesta a aparecerse.',
          },
        ],
      },
      {
        id: 'ESPERAR',
        etiqueta: 'Esperar a que abran las oficinas mañana',
        mensaje: 'Esperemos a que abran las oficinas formales mañana temprano.',
        civica: false,
        reprimenda:
          'La incomunicación nocturna es justo el momento en que se siembran pruebas y se arrancan firmas. Si nadie mira, todo es posible. Hay que movilizar ahora.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Paso 3 — Presión institucional (enseña Presión Política)
  // -------------------------------------------------------------------------
  {
    numero: 3,
    leccion: 'Presión Política',
    situacion: 'El MP intenta intimidar a Doña Elena con un delito inventado.',
    apertura: [
      {
        ...ELENA,
        texto:
          'Ahora me dicen a MÍ que me van a levantar un acta por motín y obstrucción si no nos retiramos. 😰',
      },
      {
        ...ABOGADA,
        texto:
          'Es un farol. Pero necesitamos que alguien con facultades les respire en la nuca, y no soy yo a esta hora.',
      },
    ],
    opciones: [
      {
        id: 'DDHH',
        etiqueta: 'Activar la Visitaduría de Derechos Humanos',
        mensaje:
          'Llamo a la Visitaduría de Derechos Humanos e ingreso folio de queja por detención arbitraria: posesión simple despenalizada, sin flagrancia justificada. Y lo publico con el número de folio.',
        civica: true,
        efectos: { presionPolitica: 25 },
        respuesta: [
          {
            ...ABOGADA,
            texto:
              'Llegó el visitador con folio en mano. El fiscal cambió de cara en tres segundos.',
          },
          {
            ...ELENA,
            texto: '¡Están sacando a Gael! 🙏',
          },
          {
            autor: 'Red Vecinal',
            avatar: '⚖️',
            esNota: true,
            texto:
              'Presión Política es tener a quién llamar para que otra institución vigile a la que te está aplastando. No es poder: es fricción.',
          },
        ],
      },
      {
        id: 'RETIRARSE',
        etiqueta: 'Retirarse para no arriesgar a Doña Elena',
        mensaje: 'Mejor retírense todos, no vaya a ser que la detengan a usted también.',
        civica: false,
        reprimenda:
          'Ese farol funciona precisamente porque casi siempre se lo creen. Si la multitud se va, Gael pasa la noche solo. Escala la queja: es lo único que ellos no controlan.',
      },
    ],
  },
];

/** Cierre del chat: la liberación y la epifanía (GUIA v2.2 sección 2.B). */
export const EPIFANIA_NIVEL_0: MensajeChat[] = [
  {
    ...GAEL,
    texto:
      'Ya salí, banda. Gracias a todos los que fueron al MP a hacer bola. Me querían quebrar, pero al ver a tanta gente afuera y al de Derechos Humanos, no se atrevieron a pedirme un peso.',
  },
  {
    ...ELENA,
    texto: '¡Dios los bendiga! Nos ahorraron la mordida de 25 mil pesos. 🙏',
  },
  {
    ...GAEL,
    texto:
      'Pero el comandante me lo dijo en la oreja antes de soltarme: "Hoy te salvaste, chamaco, pero el reglamento municipal y la ley federal nos siguen dando permiso de pararte cuando queramos. Mañana te agarro otra vez".',
  },
  {
    ...GAEL,
    texto:
      'Vecinos… si no cambiamos la ley, esto no se va a acabar nunca. Hoy fue por mí. Mañana va a ser por alguien que no tenga quién le haga bola.',
  },
];

/** Texto del botón que activa el mandato del Art. 71 fr. IV. */
export const CIERRE_NIVEL_0 = {
  titulo: 'Ganaste la noche. No ganaste el problema.',
  texto:
    'Rescataste a Gael sin pagar un solo peso de mordida. Pero la facultad que usó esa patrulla sigue vigente, y el reglamento que la ampara también. Lo que hiciste hoy tendrás que repetirlo cada semana, con cada vecino, para siempre — a menos que cambies la norma.',
  boton: 'Activar Artículo 71: Iniciativa Ciudadana',
} as const;
