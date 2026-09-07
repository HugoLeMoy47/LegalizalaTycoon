/**
 * Despachador de eventos por umbrales criticos (GUIA seccion 4, GDD seccion 8).
 *
 * Regla de diseño (Bitacora #005): los eventos NO son ruido aleatorio semanal,
 * son consecuencia procedimental del estado de los recursos. El Event Deck es
 * la unica pieza con azar, y es azar determinista sembrado por `semilla`.
 */

import {
  ALIADOS_MINIMOS_SEMANA_48,
  CASTIGO_ALERTA_REGIMEN_APOYO,
  CASTIGO_APOYO_SIN_COLECTIVO,
  CASTIGO_RUPTURA_INTERNA_APOYO,
  CASTIGO_RUPTURA_INTERNA_PRESION,
  ENFRIAMIENTO_ALERTA_REGIMEN,
  ENFRIAMIENTO_EVENTO_SEMANAS,
  ENFRIAMIENTO_RUPTURA_INTERNA,
  PROBABILIDAD_EVENTO_SEMANAL,
  RECUPERACION_SEMANAL_CON_COLECTIVO,
  RECUPERACION_SEMANAL_SIN_COLECTIVO,
  SEMANAS_RELOJ_PERDIDAS_SIN_COLECTIVO,
  UMBRAL_ALERTA_REGIMEN,
  UMBRAL_OFERTA_MUTILACION,
  UMBRAL_RUPTURA_INTERNA,
} from './balance';
import { EVENT_DECK, type CartaEvento } from './data/narrativa';
import { aliadosActivos, miembroPorRol } from './estado';
import { empeorarPostura } from './acciones';
import type { Decision, GameState, ReporteColectivo } from './types';
import { acotar, elegir, ocurre, registrar } from './utilidades';

// ---------------------------------------------------------------------------
// B) Alerta del Regimen — presionPolitica >= 80 (GUIA 4.B)
// ---------------------------------------------------------------------------

function semanasDesde(estado: GameState, clave: string, enfriamiento: number): boolean {
  const marca = estado.banderas[`${clave}-${Math.floor(estado.semanaActual / enfriamiento)}`];
  return !marca;
}

function marcar(estado: GameState, clave: string, enfriamiento: number): void {
  estado.banderas[`${clave}-${Math.floor(estado.semanaActual / enfriamiento)}`] = true;
}

export function dispararAlertaDelRegimen(estado: GameState): void {
  if (estado.recursos.presionPolitica < UMBRAL_ALERTA_REGIMEN) return;
  if (!semanasDesde(estado, 'alerta-regimen', ENFRIAMIENTO_ALERTA_REGIMEN)) return;
  marcar(estado, 'alerta-regimen', ENFRIAMIENTO_ALERTA_REGIMEN);

  const vocero = miembroPorRol(estado, 'VOCERO');
  const voceroContiene = Boolean(vocero?.activo && vocero.horasAsignadas > 0);

  if (voceroContiene) {
    registrar(
      estado,
      'GACETA',
      'Guerra sucia contenida',
      `Salieron tres columnas pagadas y una granja de bots con tu nombre. ${vocero?.nombre} dio la cara en la conferencia de las 8 y desactivó el golpe antes del mediodía.`,
    );
    return;
  }

  estado.recursos.apoyoSocial = acotar(
    estado.recursos.apoyoSocial - CASTIGO_ALERTA_REGIMEN_APOYO,
  );
  registrar(
    estado,
    'CRISIS',
    'Alerta del régimen: campaña de desprestigio',
    `Tu presión política encendió los focos rojos del aparato. Columnas pagadas, bots y una auditoría "de rutina" a la asociación civil. Sin vocería que responda, la narrativa la escribieron ellos. Apoyo Social −${CASTIGO_ALERTA_REGIMEN_APOYO}%.`,
  );
}

// ---------------------------------------------------------------------------
// Ruptura interna — apoyoSocial < 25 (GDD seccion 8)
// ---------------------------------------------------------------------------

export function dispararRupturaInterna(estado: GameState): void {
  if (estado.recursos.apoyoSocial >= UMBRAL_RUPTURA_INTERNA) return;
  if (!semanasDesde(estado, 'ruptura-interna', ENFRIAMIENTO_RUPTURA_INTERNA)) return;
  marcar(estado, 'ruptura-interna', ENFRIAMIENTO_RUPTURA_INTERNA);

  const enlace = miembroPorRol(estado, 'ENLACE_BASE');
  if (enlace?.activo && enlace.horasAsignadas > 0) {
    registrar(
      estado,
      'GACETA',
      'Asamblea áspera, pero de pie',
      `La asamblea se puso dura: reclamos por las negociaciones y dos colectivos amagaron con salirse. ${enlace.nombre} se quedó hasta la madrugada y los convenció de aguantar una semana más.`,
    );
    return;
  }

  estado.recursos.apoyoSocial = acotar(
    estado.recursos.apoyoSocial - CASTIGO_RUPTURA_INTERNA_APOYO,
  );
  estado.recursos.presionPolitica = acotar(
    estado.recursos.presionPolitica - CASTIGO_RUPTURA_INTERNA_PRESION,
  );
  registrar(
    estado,
    'CRISIS',
    'Fisura interna en el movimiento',
    `"Ya nada más negocias en lo oscurito." La asamblea se rompió en dos y un colectivo retiró su firma del pliego. Apoyo Social −${CASTIGO_RUPTURA_INTERNA_APOYO}%, Presión Política −${CASTIGO_RUPTURA_INTERNA_PRESION}%.`,
  );
}

// ---------------------------------------------------------------------------
// C) Oferta de Ley Mutilada (GUIA 4.C)
// ---------------------------------------------------------------------------

export function dispararOfertaMutilacion(estado: GameState): void {
  const comision = estado.comisionActiva;
  if (!comision || comision.congelada) return;
  if (comision.dictamenAprobado) return;
  if (comision.relojCongeladoraSemanas > UMBRAL_OFERTA_MUTILACION) return;
  if (estado.banderas[`mutilacion-${comision.id}`]) return;
  if (estado.decisionPendiente) return;
  estado.banderas[`mutilacion-${comision.id}`] = true;

  const decision: Decision = {
    id: 'LEY_MUTILADA',
    titulo: 'Oferta de las bancadas: dictamen a cambio de dientes',
    texto:
      '“Mira, así como está no pasa. Le quitamos el autocultivo y el presupuesto para salud pública, y te lo dictaminamos la próxima semana. Todos ganamos en la foto.” El coordinador sonríe y pide la cuenta.',
    opciones: [
      {
        id: 'ACEPTAR',
        etiqueta: 'Aceptar el dictamen mutilado',
        descripcion: 'La ley avanza esta semana, pero sin mecanismos de sanción ni presupuesto.',
        consecuencias: [
          'Dictamen aprobado de inmediato',
          'Apoyo Social −35%',
          'La iniciativa queda marcada como mutilada en el epílogo',
        ],
      },
      {
        id: 'RECHAZAR',
        etiqueta: 'Rechazar y sostener el texto íntegro',
        descripcion: 'Conservas la ley completa y el respeto de las bases. El reloj sigue corriendo.',
        consecuencias: [
          'Nada cambia esta semana',
          `Quedan ${comision.relojCongeladoraSemanas} semanas antes de la congeladora`,
        ],
      },
    ],
  };

  estado.decisionPendiente = decision;
  registrar(
    estado,
    'DECISION',
    'Te ofrecen un trato',
    'Las bancadas ponen sobre la mesa un dictamen sin dientes. Tienes que decidir antes de avanzar la semana.',
  );
}

// ---------------------------------------------------------------------------
// Maña del Movimiento de la Deformacion: la medalla o la congeladora (GDD 6)
// ---------------------------------------------------------------------------

export const UMBRAL_RELOJ_CESION_AUTORIA = 6;

export function dispararCesionAutoria(estado: GameState): void {
  const comision = estado.comisionActiva;
  if (!comision || comision.congelada || comision.dictamenAprobado) return;
  if (comision.fase === 'MUNICIPAL') return;
  if (comision.relojCongeladoraSemanas > UMBRAL_RELOJ_CESION_AUTORIA) return;
  if (estado.banderas[`autoria-${comision.id}`]) return;
  if (estado.decisionPendiente) return;

  const bancadaGuinda = comision.legisladores.filter(
    (l) => l.partido === 'DEFORMACION' && l.postura !== 'FAVOR',
  );
  if (bancadaGuinda.length === 0) return;
  const coordinador = bancadaGuinda.find((l) => l.esCoordinador) ?? bancadaGuinda[0];
  estado.banderas[`autoria-${comision.id}`] = true;

  estado.decisionPendiente = {
    id: 'CESION_AUTORIA',
    titulo: 'La bancada guinda quiere la medalla',
    texto: `${coordinador.nombre} te recibe sin sentarse: “La iniciativa está bien, pero la presenta la bancada. Tú vas en la foto, atrás. Si no, no hay quién la agende.”`,
    opciones: [
      {
        id: 'CEDER',
        etiqueta: 'Ceder la autoría de la iniciativa',
        descripcion: `Los ${bancadaGuinda.length} votos guinda de la comisión se alinean de inmediato.`,
        consecuencias: [
          `${bancadaGuinda.length} legislador(es) pasan a FAVOR`,
          'Apoyo Social −15%',
          'El colectivo desaparece del relato público',
        ],
      },
      {
        id: 'NEGAR',
        etiqueta: 'Sostener que la firma es de la asamblea',
        descripcion: 'Conservas la autoría ciudadana y pagas el costo en calendario.',
        consecuencias: ['Reloj de la congeladora −2 semanas', 'Ningún voto se mueve'],
      },
    ],
  };

  registrar(
    estado,
    'DECISION',
    'Te piden la autoría',
    'El coordinador de la bancada mayoritaria condiciona el agendamiento del dictamen.',
  );
}

// ---------------------------------------------------------------------------
// A) Semana 48 — Crisis Obligatoria de Burnout (GUIA 4.A)
// ---------------------------------------------------------------------------

export function dispararSemana48(estado: GameState): ReporteColectivo {
  const aliados = aliadosActivos(estado);
  const colectivoSostuvo = aliados.length >= ALIADOS_MINIMOS_SEMANA_48;

  const lineas: string[] = [];
  let impactoApoyoSocial = 0;
  let impactoRelojSemanas = 0;

  if (colectivoSostuvo) {
    for (const aliado of aliados) {
      switch (aliado.rol) {
        case 'ABOGADA':
          lineas.push(
            `${aliado.nombre} sostuvo tres reuniones técnicas con los asesores de la comisión y corrigió el articulado observado.`,
          );
          break;
        case 'VOCERO':
          lineas.push(
            `${aliado.nombre} asumió la vocería en dos entrevistas y una conferencia; la cobertura no cayó.`,
          );
          break;
        case 'ENLACE_BASE':
          lineas.push(
            `${aliado.nombre} mantuvo las asambleas semanales y el registro de firmas al corriente.`,
          );
          break;
        default:
          break;
      }
    }
    lineas.push('El reloj de la comisión se mantuvo detenido: nadie perdió terreno por tu ausencia.');
    lineas.push(
      `Recuperación del coordinador: +${RECUPERACION_SEMANAL_CON_COLECTIVO}% de Resistencia por cada semana de descanso.`,
    );
  } else {
    lineas.push('Ninguna reunión de comisión tuvo interlocutor del colectivo.');
    lineas.push('Dos medios buscaron postura oficial y nadie respondió el teléfono.');
    lineas.push('La asamblea de la colonia se suspendió por falta de convocatoria.');
    lineas.push(
      `Se perdieron ${SEMANAS_RELOJ_PERDIDAS_SIN_COLECTIVO} semanas de reloj legislativo y ${CASTIGO_APOYO_SIN_COLECTIVO}% de Apoyo Social.`,
    );
    impactoApoyoSocial = -CASTIGO_APOYO_SIN_COLECTIVO;
    impactoRelojSemanas = -SEMANAS_RELOJ_PERDIDAS_SIN_COLECTIVO;
    estado.recursos.apoyoSocial = acotar(
      estado.recursos.apoyoSocial - CASTIGO_APOYO_SIN_COLECTIVO,
    );
  }

  const reporte: ReporteColectivo = {
    semanaEmision: estado.semanaActual,
    aliadosActivos: aliados.length,
    colectivoSostuvo,
    lineas,
    impactoRelojSemanas,
    impactoApoyoSocial,
    impactoResistencia: colectivoSostuvo
      ? RECUPERACION_SEMANAL_CON_COLECTIVO * 3
      : RECUPERACION_SEMANAL_SIN_COLECTIVO * 3,
  };

  estado.reporteSemana48 = reporte;
  estado.estadoJuego = 'DESCANSO_FORZADO_SEM_48';
  estado.banderas.semana48 = true;

  registrar(
    estado,
    'CRISIS',
    'Descanso Forzado Obligatorio (semanas 48-50)',
    colectivoSostuvo
      ? 'El cuerpo dijo basta: taquicardia, insomnio y una consulta de urgencias. Quedas inhabilitado tres semanas. El colectivo toma el relevo.'
      : 'El cuerpo dijo basta: taquicardia, insomnio y una consulta de urgencias. Quedas inhabilitado tres semanas. No hay quien tome el relevo.',
  );

  return reporte;
}

/** Recuperacion semanal durante el Descanso Forzado. */
export function aplicarDescansoForzado(estado: GameState): number {
  const sostuvo = estado.reporteSemana48?.colectivoSostuvo ?? false;
  const recuperacion = sostuvo
    ? RECUPERACION_SEMANAL_CON_COLECTIVO
    : RECUPERACION_SEMANAL_SIN_COLECTIVO;
  estado.recursos.resistencia = acotar(estado.recursos.resistencia + recuperacion);
  return recuperacion;
}

// ---------------------------------------------------------------------------
// Event Deck (GDD seccion 13)
// ---------------------------------------------------------------------------

function cartasElegibles(estado: GameState): CartaEvento[] {
  return EVENT_DECK.filter((carta) => {
    if (estado.banderas[`carta-${carta.id}`]) return false;
    if (!carta.fases.includes(estado.faseActual)) return false;
    if (carta.requiereComision && !estado.comisionActiva) return false;
    if (carta.id === 'COOPTACION' && aliadosActivos(estado).length === 0) return false;
    return true;
  });
}

export function levantarCartaEvento(estado: GameState): CartaEvento | null {
  if (estado.decisionPendiente) return null;
  if (estado.semanaActual - estado.semanaUltimaCarta < ENFRIAMIENTO_EVENTO_SEMANAS) return null;
  if (!ocurre(estado, PROBABILIDAD_EVENTO_SEMANAL)) return null;

  const elegibles = cartasElegibles(estado);
  if (elegibles.length === 0) return null;

  const carta = elegir(estado, elegibles);
  estado.banderas[`carta-${carta.id}`] = true;
  estado.semanaUltimaCarta = estado.semanaActual;
  aplicarCarta(estado, carta);
  return carta;
}

export const RETRASO_CHAPULIN_SEMANAS = 3;
export const RETRASO_QUORUM_SEMANAS = 1;
export const CASTIGO_MADRUGUETE_PRESION = 5;
export const FACTOR_CORTINA_DE_HUMO = 0.6;

function aplicarCarta(estado: GameState, carta: CartaEvento): void {
  const comision = estado.comisionActiva;

  switch (carta.id) {
    case 'DIPUTADO_CHAPULIN': {
      if (comision) {
        comision.relojCongeladoraSemanas = Math.max(
          0,
          comision.relojCongeladoraSemanas - RETRASO_CHAPULIN_SEMANAS,
        );
      }
      registrar(
        estado,
        'CRISIS',
        carta.titulo,
        `${carta.texto} Reloj de la congeladora −${RETRASO_CHAPULIN_SEMANAS} semanas.`,
      );
      break;
    }

    case 'MADRUGUETE': {
      if (estado.recursos.horasExtraMetidas > 0) {
        registrar(
          estado,
          'LOGRO',
          carta.titulo,
          `${carta.texto} Ya estabas despierto: llegaron doce observadores con cámara y el madruguete se cayó solo.`,
        );
        break;
      }
      const objetivo = comision?.legisladores.find((l) => l.postura === 'FAVOR');
      if (objetivo) objetivo.postura = empeorarPostura(objetivo.postura);
      estado.recursos.presionPolitica = acotar(
        estado.recursos.presionPolitica - CASTIGO_MADRUGUETE_PRESION,
      );
      registrar(
        estado,
        'CRISIS',
        carta.titulo,
        `${carta.texto} Nadie del colectivo llegó a tiempo.${objetivo ? ` ${objetivo.nombre} se dobló y ahora es ${objetivo.postura}.` : ''} Presión Política −${CASTIGO_MADRUGUETE_PRESION}%.`,
      );
      break;
    }

    case 'COOPTACION': {
      const candidato = elegir(estado, aliadosActivos(estado));
      estado.decisionPendiente = {
        id: 'COOPTACION_LIDER',
        titulo: 'Cooptación de liderazgo',
        texto: `${carta.texto} La pieza es ${candidato.nombre}. Te lo dijo con vergüenza: lleva año y medio sin cobrar.`,
        contexto: { miembroId: candidato.id },
        opciones: [
          {
            id: 'RETENER',
            etiqueta: 'Conseguir recursos para retenerle',
            descripcion: 'Mueves cielo, mar y tierra para pagarle una beca del fondo de apoyo.',
            consecuencias: ['Fondos −$12,000', 'Resistencia −6%', 'Conservas al perfil'],
          },
          {
            id: 'DEJAR_IR',
            etiqueta: 'Dejarle ir con la puerta abierta',
            descripcion: 'Le agradeces y sigues sin esa pieza.',
            consecuencias: ['Pierdes el perfil y sus horas', 'Apoyo Social −8%'],
          },
        ],
      };
      registrar(estado, 'DECISION', carta.titulo, carta.texto);
      break;
    }

    case 'QUORUM_BANQUETE': {
      if (comision) {
        comision.relojCongeladoraSemanas = Math.max(
          0,
          comision.relojCongeladoraSemanas - RETRASO_QUORUM_SEMANAS,
        );
      }
      registrar(
        estado,
        'CRISIS',
        carta.titulo,
        `${carta.texto} Reloj de la congeladora −${RETRASO_QUORUM_SEMANAS} semana.`,
      );
      break;
    }

    case 'CORTINA_DE_HUMO': {
      const antes = estado.recursos.presionPolitica;
      estado.recursos.presionPolitica = acotar(antes * FACTOR_CORTINA_DE_HUMO);
      registrar(
        estado,
        'CRISIS',
        carta.titulo,
        `${carta.texto} Presión Política ${Math.round(antes)}% → ${Math.round(estado.recursos.presionPolitica)}%.`,
      );
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Orquestador
// ---------------------------------------------------------------------------

/**
 * Corre todos los despachadores en el orden canonico del turno.
 *
 * v2.0: durante las Etapas A y B (semanas 1-5) el expediente todavia no existe
 * para el Congreso, asi que ningun disparador legislativo tiene sentido. Solo
 * quedan vivos los sociales (alerta del regimen, fisura interna), que dependen
 * de recursos y no de comisiones.
 */
export function despacharEventos(estado: GameState): void {
  dispararAlertaDelRegimen(estado);
  dispararRupturaInterna(estado);
  if (!estado.comisionDesbloqueada) return;
  levantarCartaEvento(estado);
  dispararCesionAutoria(estado);
  dispararOfertaMutilacion(estado);
}
