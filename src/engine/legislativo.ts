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
  SEMANAS_TOTALES,
  VICTORIA,
} from './balance';
import { comisionesDeFase } from './data/comisiones';
import { MESA_POR_FASE } from './data/ruta';
import { faseDeSemana, marcarNodo, sellar } from './estado';
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
    'GACETA',
    'Turnado a la siguiente comisión',
    `El expediente pasa a ${siguiente.nombre}. Reloj de la congeladora: ${siguiente.relojCongeladoraSemanas} semanas.`,
  );
}

function intentarPleno(estado: GameState, comision: Comision): void {
  if (estado.recursos.presionPolitica < comision.presionPlenoRequerida) {
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

  marcarNodo(estado, comision.nodoPlenoId, 'APROBADO');
  estado.comisionesResueltas.push(comision);
  estado.comisionActiva = null;
  registrar(
    estado,
    'LOGRO',
    'Aprobado en el Pleno',
    `El Pleno vota a favor. La instancia ${etiquetaFase(comision.fase)} queda superada.`,
  );

  if (comision.esUltimaInstancia) {
    estado.banderas.senadoAprobado = true;
    return;
  }

  registrar(
    estado,
    'SISTEMA',
    'Fin de la instancia',
    `Hasta aquí llega esta instancia. El siguiente orden de gobierno abre su periodo de sesiones cuando toque el calendario.`,
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

/** Se llama despues de incrementar la semana. */
export function evaluarTransicionDeFase(estado: GameState): void {
  const faseCalendario = faseDeSemana(estado.semanaActual);
  if (faseCalendario === estado.faseActual) return;

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
