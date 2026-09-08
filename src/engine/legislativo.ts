/**
 * Reloj legislativo: dictamenes, congeladora, votaciones en Pleno,
 * transiciones de fase y desenlaces.
 *
 * Embudo por fase (GDD seccion 5):
 *   Mesa Directiva -> Comision(es) -> Pleno -> siguiente orden de gobierno
 */

import {
  CASTIGO_FASE_INCOMPLETA,
  CASTIGO_RELOJ_DICTAMEN_DEBIL,
  SEMANAS_ORDEN_DEL_DIA,
  SEMANAS_RECESO_ENTRE_FASES,
  SEMANAS_TOTALES,
  VICTORIA,
} from './balance';
import { comisionesDeFase } from './data/comisiones';
import { MESA_POR_FASE } from './data/ruta';
import { SEMANA_CALENDARIO_FASE, faseSiguiente, marcarNodo, sellar } from './estado';
import { emitir } from './telemetria';
import type { Comision, FaseJuego, GameState, Postura } from './types';
import { acotar, registrar } from './utilidades';

// ---------------------------------------------------------------------------
// Conteo de votos
// ---------------------------------------------------------------------------

export interface ConteoVotos {
  FAVOR: number;
  INDECISO: number;
  OPOSITOR: number;
  total: number;
  requeridos: number;
  suficientes: boolean;
  porcentajeFavor: number;
}

export function contarVotos(comision: Comision | null): ConteoVotos {
  const vacio: ConteoVotos = {
    FAVOR: 0,
    INDECISO: 0,
    OPOSITOR: 0,
    total: 0,
    requeridos: 0,
    suficientes: false,
    porcentajeFavor: 0,
  };
  if (!comision) return vacio;

  const conteo = { FAVOR: 0, INDECISO: 0, OPOSITOR: 0 } as Record<Postura, number>;
  for (const l of comision.legisladores) conteo[l.postura] += 1;
  const total = comision.legisladores.length;

  return {
    ...conteo,
    total,
    requeridos: comision.votosFavorRequeridos,
    suficientes: conteo.FAVOR >= comision.votosFavorRequeridos,
    porcentajeFavor: total === 0 ? 0 : conteo.FAVOR / total,
  };
}

// ---------------------------------------------------------------------------
// Resolucion semanal de la comision activa
// ---------------------------------------------------------------------------

/** ¿Quedan comisiones de la misma fase por dictaminar? */
function hayMasComisionesDeFase(estado: GameState, fase: FaseJuego): boolean {
  return estado.colaComisiones.some((c) => c.fase === fase);
}

/**
 * Paso legislativo del turno: intenta dictaminar, y si la comision era la
 * ultima de su fase, somete el asunto al Pleno.
 */
export function resolverLegislativo(estado: GameState): void {
  const comision = estado.comisionActiva;
  if (!comision || comision.congelada) return;

  // Las etapas de tramite (foro de consulta, opinion de Hacienda) no votan:
  // consumen sesiones. Si todavia no cierran, la semana termina aqui.
  if (comision.tipo !== 'DICTAMINADORA') {
    if (!resolverTramite(estado, comision)) return;
    if (hayMasComisionesDeFase(estado, comision.fase)) {
      pasarASiguienteComision(estado);
      return;
    }
    intentarPleno(estado, comision);
    return;
  }

  if (!comision.dictamenAprobado) {
    const votos = contarVotos(comision);
    if (!votos.suficientes) return;

    if (estado.solidezTecnica < comision.solidezTecnicaRequerida) {
      // Tienes los votos, pero el texto hace agua: te lo regresan.
      comision.relojCongeladoraSemanas = Math.max(
        0,
        comision.relojCongeladoraSemanas - CASTIGO_RELOJ_DICTAMEN_DEBIL,
      );
      registrar(
        estado,
        'ADVERTENCIA',
        'Dictamen devuelto por técnica jurídica',
        `Los votos estaban (${votos.FAVOR}/${votos.requeridos}), pero los asesores encontraron vicios de constitucionalidad. Necesitas Solidez Técnica ≥ ${comision.solidezTecnicaRequerida}% (tienes ${Math.round(estado.solidezTecnica)}%). Reloj −${CASTIGO_RELOJ_DICTAMEN_DEBIL} semana.`,
      );
      return;
    }

    comision.dictamenAprobado = true;
    marcarNodo(estado, comision.nodoId, 'APROBADO');
    sellar(estado, estado.iniciativaMutilada ? 'DICTAMEN_CON_ENMIENDAS' : 'APROBADO');
    registrar(
      estado,
      'LOGRO',
      'Dictamen aprobado en comisión',
      `${comision.nombre} dictamina a favor con ${votos.FAVOR} de ${votos.total} votos.`,
    );
  }

  // Con dictamen en mano: o pasa a la siguiente comision de la fase, o al Pleno.
  if (hayMasComisionesDeFase(estado, comision.fase)) {
    pasarASiguienteComision(estado);
    return;
  }

  intentarPleno(estado, comision);
}

/**
 * Etapas que se cuentan en sesiones y no en votos (GUIA v2.2 seccion 4.1).
 *
 * Devuelve true cuando el tramite queda cerrado y el expediente puede seguir
 * su camino. Mientras no cierre, el reloj de la congeladora sigue corriendo:
 * un foro que no puedes cerrar por falta de respaldo te congela igual.
 */
function resolverTramite(estado: GameState, comision: Comision): boolean {
  if (comision.dictamenAprobado) return true;

  // Sin presupuesto no hay nada que opinar en Hacienda: mutilar la ley te
  // ahorra una comision entera. Incentivo perverso deliberado.
  if (comision.seOmiteSiMutilada && estado.iniciativaMutilada) {
    comision.dictamenAprobado = true;
    marcarNodo(estado, comision.nodoId, 'OMITIDO');
    registrar(
      estado,
      'ADVERTENCIA',
      'Hacienda devuelve el expediente sin materia',
      `${comision.nombre} no tiene qué dictaminar: al aceptar el dictamen mutilado, la ley se quedó sin presupuesto asignado. Te ahorras ${comision.semanasTramite} semanas de trámite. Ese fue siempre el punto del trato.`,
    );
    return true;
  }

  if (
    comision.tipo === 'PARLAMENTO_ABIERTO' &&
    estado.recursos.apoyoSocial < comision.apoyoSocialRequerido
  ) {
    if (!estado.banderas[`foro-vacio-${comision.id}`]) {
      estado.banderas[`foro-vacio-${comision.id}`] = true;
      registrar(
        estado,
        'ADVERTENCIA',
        'El foro se convoca y no llega nadie',
        `${comision.nombre} abrió el registro de ponentes y la sala quedó a un tercio. Necesitas ${comision.apoyoSocialRequerido}% de Apoyo Social para que la consulta cuente (tienes ${Math.round(estado.recursos.apoyoSocial)}%). Mientras tanto, el reloj corre.`,
      );
    }
    return false;
  }

  if (
    comision.tipo === 'PRESUPUESTO' &&
    estado.solidezTecnica < comision.solidezTecnicaRequerida
  ) {
    if (!estado.banderas[`hacienda-${comision.id}`]) {
      estado.banderas[`hacienda-${comision.id}`] = true;
      registrar(
        estado,
        'ADVERTENCIA',
        'Hacienda pide impacto presupuestario',
        `${comision.nombre} exige una memoria de cálculo que tu articulado no trae. Necesitas Solidez Técnica ≥ ${comision.solidezTecnicaRequerida}% (tienes ${Math.round(estado.solidezTecnica)}%).`,
      );
    }
    return false;
  }

  comision.semanasTramiteCumplidas += 1;

  if (comision.semanasTramiteCumplidas < comision.semanasTramite) {
    registrar(
      estado,
      'SISTEMA',
      comision.tipo === 'PARLAMENTO_ABIERTO' ? 'Sesión de parlamento abierto' : 'Sesión en Hacienda',
      `${comision.nombre}: sesión ${comision.semanasTramiteCumplidas} de ${comision.semanasTramite}. El trámite avanza solo con el calendario.`,
    );
    return false;
  }

  comision.dictamenAprobado = true;
  marcarNodo(estado, comision.nodoId, 'APROBADO');
  registrar(
    estado,
    'LOGRO',
    comision.tipo === 'PARLAMENTO_ABIERTO' ? 'Cierra el parlamento abierto' : 'Hacienda emite opinión favorable',
    comision.tipo === 'PARLAMENTO_ABIERTO'
      ? `${comision.nombre} concluye tras ${comision.semanasTramite} sesiones. Las relatorías quedan en la gaceta y el expediente puede seguir.`
      : `${comision.nombre} avala el impacto presupuestario. La ley conserva sus dientes y su dinero.`,
  );
  return true;
}

function pasarASiguienteComision(estado: GameState): void {
  const actual = estado.comisionActiva;
  if (!actual) return;
  const indice = estado.colaComisiones.findIndex((c) => c.fase === actual.fase);
  if (indice === -1) return;

  const [siguiente] = estado.colaComisiones.splice(indice, 1);
  estado.comisionesResueltas.push(actual);
  estado.comisionActiva = siguiente;
  marcarNodo(estado, siguiente.nodoId, 'ACTIVO');
  sellar(estado, 'EN_COMISION');
  registrar(
    estado,
    'SISTEMA',
    siguiente.tipo === 'DICTAMINADORA' ? 'Turnado a la siguiente comisión' : 'Se abre una etapa de trámite',
    siguiente.tipo === 'DICTAMINADORA'
      ? `El expediente pasa a ${siguiente.nombre}. Reloj de la congeladora: ${siguiente.relojCongeladoraSemanas} semanas.`
      : `El expediente pasa a ${siguiente.nombre}: ${siguiente.semanasTramite} sesiones de calendario que no dependen de votos. ${
          siguiente.tipo === 'PARLAMENTO_ABIERTO'
            ? `Necesitas ${siguiente.apoyoSocialRequerido}% de Apoyo Social para que la consulta cuente.`
            : `Necesitas ${siguiente.solidezTecnicaRequerida}% de Solidez Técnica para sostener el impacto presupuestario.`
        }`,
  );
}

function intentarPleno(estado: GameState, comision: Comision): void {
  if (estado.recursos.presionPolitica < comision.presionPlenoRequerida) {
    estado.semanasEnOrdenDelDia = 0;
    if (!estado.banderas[`pleno-espera-${comision.id}`]) {
      estado.banderas[`pleno-espera-${comision.id}`] = true;
      registrar(
        estado,
        'ADVERTENCIA',
        'El Pleno no agenda la votación',
        `El dictamen está listo, pero la Mesa Directiva no lo sube al orden del día. Necesitas ${comision.presionPlenoRequerida}% de Presión Política (tienes ${Math.round(estado.recursos.presionPolitica)}%).`,
      );
    }
    return;
  }

  /*
   * Tener el dictamen no es tener la votacion. La Mesa Directiva enlista el
   * asunto en el orden del dia y el punto se cae de la sesion varias veces
   * antes de subir a tribuna. Son semanas con el expediente vivo y el reloj
   * corriendo, no semanas muertas.
   */
  const espera = SEMANAS_ORDEN_DEL_DIA[comision.fase];
  if (estado.semanasEnOrdenDelDia < espera) {
    estado.semanasEnOrdenDelDia += 1;
    registrar(
      estado,
      'SISTEMA',
      'Enlistado en el orden del día',
      `El dictamen de ${comision.nombre} está en la lista de la sesión ${estado.semanasEnOrdenDelDia} de ${espera}. Falta que la Mesa Directiva lo suba a tribuna: mientras tanto, el reloj sigue.`,
    );
    return;
  }

  estado.semanasEnOrdenDelDia = 0;
  marcarNodo(estado, comision.nodoPlenoId, 'APROBADO');
  estado.comisionesResueltas.push(comision);
  estado.comisionActiva = null;
  registrar(
    estado,
    'LOGRO',
    'Aprobado en el Pleno',
    `El Pleno vota a favor. La instancia ${etiquetaFase(comision.fase)} queda superada.`,
  );

  if (comision.fase === 'MUNICIPAL') emitir(estado, 'APROBADO_MUNICIPAL');
  if (comision.fase === 'ESTATAL') emitir(estado, 'APROBADO_ESTATAL');

  if (comision.esUltimaInstancia) {
    estado.banderas.senadoAprobado = true;
    return;
  }

  iniciarReceso(estado, comision.fase);
}

// ---------------------------------------------------------------------------
// Ventanas de remediacion (GUIA v2.2 seccion 4)
// ---------------------------------------------------------------------------

/**
 * Receso parlamentario entre fases.
 *
 * Antes, ganar la instancia municipal en la semana 7 dejaba 23 semanas vacias
 * esperando el corte de calendario de la semana 31. Ahora el siguiente periodo
 * de sesiones abre al terminar el receso, y el corte fijo queda solo como tope
 * para quien no logro cerrar su fase.
 *
 * Durante el receso no corre el reloj de la congeladora (no hay comision
 * activa) y la Presion Politica decae al ritmo base. Es la red de seguridad
 * pedagogica: sirve para sanar Resistencia, juntar firmas y blindar el texto.
 */
export function iniciarReceso(estado: GameState, faseCerrada: FaseJuego): void {
  const siguiente = faseSiguiente(faseCerrada);
  if (!siguiente) return;

  const finPorReceso = estado.semanaActual + SEMANAS_RECESO_ENTRE_FASES + 1;
  const finPorCalendario = SEMANA_CALENDARIO_FASE[siguiente];
  estado.recesoHasta = Math.min(finPorReceso, finPorCalendario);

  const semanas = Math.max(0, estado.recesoHasta - estado.semanaActual - 1);
  const etiqueta = siguiente === 'ESTATAL' ? 'el Congreso del Estado' : 'el Congreso de la Unión';

  estado.hitoPendiente = {
    id: 'RECESO_ABIERTO',
    titulo: `Receso parlamentario · ${semanas} semanas`,
    texto: `Ganaste la instancia ${etiquetaFase(faseCerrada)}. Las cámaras cierran su periodo ordinario y ${etiqueta} no abre hasta la semana ${estado.recesoHasta}. Nadie te puede congelar un expediente que no está en trámite: úsalo.`,
    efectos: [
      'El Reloj de la Congeladora no corre durante el receso',
      'Autocuidado: llegas entera o entero a la fase más dura',
      'Movilizar: la siguiente comisión te va a pedir más Apoyo Social',
      'Investigar: el articulado que sirvió aquí no basta allá',
    ],
  };

  registrar(
    estado,
    'LOGRO',
    `Se cierra el periodo ${etiquetaFase(faseCerrada)}`,
    `Tienes ${semanas} semanas de receso antes de que abra ${etiqueta}. Es el único tramo de la partida en el que el reloj no corre en tu contra.`,
  );
}

function etiquetaFase(fase: FaseJuego): string {
  return fase === 'MUNICIPAL' ? 'municipal' : fase === 'ESTATAL' ? 'estatal' : 'federal';
}

// ---------------------------------------------------------------------------
// Reloj de la congeladora (GUIA 3.A.4)
// ---------------------------------------------------------------------------

export function avanzarRelojCongeladora(estado: GameState): void {
  const comision = estado.comisionActiva;
  if (!comision || comision.dictamenAprobado || comision.congelada) return;

  comision.relojCongeladoraSemanas -= 1;

  if (comision.relojCongeladoraSemanas <= 0) {
    comision.relojCongeladoraSemanas = 0;
    comision.congelada = true;
    marcarNodo(estado, comision.nodoId, 'CONGELADO');
    sellar(estado, 'CONGELADORA');
    registrar(
      estado,
      'DESENLACE',
      'A la congeladora',
      `Expiró el plazo reglamentario de ${comision.nombre}. El expediente se archiva sin dictamen.`,
    );
    estado.estadoJuego = 'DERROTA_CONGELADORA';
    return;
  }

  if (comision.relojCongeladoraSemanas <= 4) {
    registrar(
      estado,
      'ADVERTENCIA',
      'El reloj aprieta',
      `Quedan ${comision.relojCongeladoraSemanas} semanas para que ${comision.nombre} dictamine o el asunto se archive.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Transicion de fase
// ---------------------------------------------------------------------------

/**
 * Se llama despues de incrementar la semana.
 *
 * v2.2: la fase cambia en `min(corte del calendario, fin del receso)`. Quien
 * cierra su embudo pronto entra antes al siguiente orden de gobierno tras el
 * receso; quien no lo cierra espera al corte fijo de siempre y paga el malus
 * por escalar sin antecedente.
 */
export function evaluarTransicionDeFase(estado: GameState): void {
  const siguiente = faseSiguiente(estado.faseActual);
  if (!siguiente) return;

  const objetivo =
    estado.recesoHasta !== null
      ? Math.min(estado.recesoHasta, SEMANA_CALENDARIO_FASE[siguiente])
      : SEMANA_CALENDARIO_FASE[siguiente];
  if (estado.semanaActual < objetivo) return;

  const faseCalendario = siguiente;
  const faseAnterior = estado.faseActual;
  const quedaronPendientes =
    estado.comisionActiva !== null || hayMasComisionesDeFase(estado, faseAnterior);

  // Todo lo que quedó sin resolver de la fase anterior se marca omitido.
  for (const nodo of estado.rutaLegislativa) {
    if (nodo.fase === faseAnterior && (nodo.estado === 'PENDIENTE' || nodo.estado === 'ACTIVO')) {
      nodo.estado = 'OMITIDO';
    }
  }
  estado.colaComisiones = estado.colaComisiones.filter((c) => c.fase !== faseAnterior);
  if (estado.comisionActiva) {
    estado.comisionesResueltas.push(estado.comisionActiva);
    estado.comisionActiva = null;
  }

  estado.faseActual = faseCalendario;
  estado.recesoHasta = null;
  estado.semanasEnOrdenDelDia = 0;

  if (quedaronPendientes) {
    estado.recursos.apoyoSocial = acotar(
      estado.recursos.apoyoSocial - CASTIGO_FASE_INCOMPLETA.apoyoSocial,
    );
    estado.solidezTecnica = acotar(estado.solidezTecnica - CASTIGO_FASE_INCOMPLETA.solidezTecnica);
    registrar(
      estado,
      'CRISIS',
      'Escalas sin antecedente',
      `Cerró el periodo ${etiquetaFase(faseAnterior)} sin resolver tu asunto. Subes a la siguiente instancia sin precedente que presumir: Apoyo Social −${CASTIGO_FASE_INCOMPLETA.apoyoSocial}%, Solidez Técnica −${CASTIGO_FASE_INCOMPLETA.solidezTecnica}%.`,
    );
  }

  abrirFase(estado, faseCalendario);
}

function abrirFase(estado: GameState, fase: FaseJuego): void {
  const comisiones = comisionesDeFase(fase);
  const [primera, ...resto] = comisiones;
  estado.colaComisiones = [...estado.colaComisiones, ...resto];
  estado.comisionActiva = primera ?? null;

  marcarNodo(estado, MESA_POR_FASE[fase], 'APROBADO');
  if (primera) {
    marcarNodo(estado, primera.nodoId, 'ACTIVO');
    sellar(estado, 'TURNADO');
    sellar(estado, 'EN_COMISION');
  }

  const encabezado =
    fase === 'ESTATAL'
      ? 'Se abre el periodo en el Congreso del Estado'
      : 'Se abre el periodo en el Congreso de la Unión';
  registrar(
    estado,
    'SISTEMA',
    encabezado,
    primera
      ? `La iniciativa queda turnada a ${primera.nombre}. Reloj de la congeladora: ${primera.relojCongeladoraSemanas} semanas.`
      : 'Sin comisión asignada.',
  );
}

// ---------------------------------------------------------------------------
// Desenlaces
// ---------------------------------------------------------------------------

export interface RequisitosVictoria {
  senadoAprobado: boolean;
  resistenciaOk: boolean;
  apoyoOk: boolean;
  votosFederalesOk: boolean;
  cumplidos: boolean;
}

export function evaluarRequisitosVictoria(estado: GameState): RequisitosVictoria {
  const senadoAprobado = Boolean(estado.banderas.senadoAprobado);
  const comisionSenado = estado.comisionesResueltas.find((c) => c.esUltimaInstancia);
  const comisionDiputados = estado.comisionesResueltas.find((c) => c.id === 'com-unidas');
  const votosFederalesOk = comisionDiputados
    ? contarVotos(comisionDiputados).porcentajeFavor >= VICTORIA.porcentajeVotosFederales
    : false;

  const resistenciaOk = estado.recursos.resistencia >= VICTORIA.resistenciaMinima;
  const apoyoOk = estado.recursos.apoyoSocial >= VICTORIA.apoyoSocialMinimo;

  return {
    senadoAprobado: senadoAprobado && Boolean(comisionSenado),
    resistenciaOk,
    apoyoOk,
    votosFederalesOk,
    cumplidos:
      senadoAprobado && Boolean(comisionSenado) && resistenciaOk && apoyoOk && votosFederalesOk,
  };
}

/** Chequeo de desenlaces al cierre de cada semana. */
export function evaluarDesenlace(estado: GameState): void {
  if (estado.estadoJuego !== 'JUGANDO' && estado.estadoJuego !== 'DESCANSO_FORZADO_SEM_48') return;

  if (estado.recursos.resistencia <= 0) {
    estado.estadoJuego = 'DERROTA_BURNOUT';
    registrar(
      estado,
      'DESENLACE',
      'Colapso',
      'El cuerpo cobró la factura completa. No hubo semana 101 para ti y el colectivo se desintegró sin coordinación.',
    );
    return;
  }

  const requisitos = evaluarRequisitosVictoria(estado);
  if (requisitos.senadoAprobado) {
    if (requisitos.cumplidos) {
      marcarNodo(estado, 'dof', 'APROBADO');
      sellar(estado, 'PUBLICADO_DOF');
      estado.estadoJuego = 'VICTORIA_DOF';
      registrar(
        estado,
        'DESENLACE',
        'Publicado en el Diario Oficial de la Federación',
        estado.iniciativaMutilada
          ? 'La reforma se publica en el DOF. Sin autocultivo y sin presupuesto: una ley que existe pero no muerde.'
          : 'La reforma se publica íntegra en el DOF. Entra en vigor al día siguiente.',
      );
      return;
    }
    if (!estado.banderas.avisoRequisitosDOF) {
      estado.banderas.avisoRequisitosDOF = true;
      registrar(
        estado,
        'ADVERTENCIA',
        'La promulgación no sale',
        `El Ejecutivo retiene la publicación. Faltan condiciones: ${!requisitos.resistenciaOk ? `Resistencia ≥ ${VICTORIA.resistenciaMinima}% · ` : ''}${!requisitos.apoyoOk ? `Apoyo Social ≥ ${VICTORIA.apoyoSocialMinimo}% · ` : ''}${!requisitos.votosFederalesOk ? `${Math.round(VICTORIA.porcentajeVotosFederales * 100)}% de votos en Diputados` : ''}`.replace(/ · $/, ''),
      );
    }
  }

  if (estado.semanaActual > SEMANAS_TOTALES) {
    estado.semanaActual = SEMANAS_TOTALES;
    estado.estadoJuego = 'DERROTA_CONGELADORA';
    sellar(estado, 'CONGELADORA');
    registrar(
      estado,
      'DESENLACE',
      'Terminó la legislatura',
      'Se agotaron las 100 semanas. Los asuntos no dictaminados se declaran precluidos y el expediente pasa al archivo muerto.',
    );
  }
}
