/**
 * TABLA DE BALANCE — todas las constantes numericas del juego viven aqui.
 *
 * Regla del proyecto: ningun modulo del motor puede tener numeros magicos.
 * Ajustar el balanceo debe ser editar este archivo y volver a correr
 * `npm run test` + `npm run sim`.
 *
 * Referencias: GUIA seccion 3 y 4, GDD secciones 8 y 12, Bitacora #001 y #005.
 */

import type { FaseJuego, VerboAccion } from './types';

// --- Linea de tiempo -------------------------------------------------------

export const SEMANAS_TOTALES = 100;
export const SEMANA_INICIO_ESTATAL = 31;
export const SEMANA_INICIO_FEDERAL = 66;
/** Descanso Forzado Obligatorio (GUIA 4.A). */
export const SEMANAS_DESCANSO_FORZADO = [48, 49, 50] as const;
export const SEMANA_DISPARADOR_BURNOUT = 48;

// --- Recursos iniciales ----------------------------------------------------

export const RECURSOS_INICIALES = {
  // 30 y no 25: arrancar justo en el umbral de ruptura interna hacía que el
  // primer drenaje semanal detonara una fisura del movimiento en la semana 1.
  apoyoSocial: 30,
  presionPolitica: 5,
  resistencia: 100,
  fondos: 20_000,
  horasBaseSemana: 40,
  horasExtraMetidas: 0,
} as const;

export const SOLIDEZ_TECNICA_INICIAL = 20;

// --- Horas extra / autoexplotacion (GUIA 3.A.1, GDD 8) ---------------------

export const BLOQUE_HORAS_EXTRA = 10;
export const COSTO_RESISTENCIA_POR_BLOQUE = 15;
export const MAX_BLOQUES_HORAS_EXTRA = 3; // hasta +30 hrs sobre la base
/** A partir de la 3a semana consecutiva se acumula fatiga (GDD 8). */
export const SEMANAS_ANTES_DE_FATIGA_ACUMULADA = 2;
export const INCREMENTO_FATIGA_ACUMULADA = 0.25;
export const TOPE_MULTIPLICADOR_FATIGA = 2.0;

// --- Drenajes pasivos (GUIA 3.A.2 y 3.A.3) ---------------------------------

export const DRENAJE_RESISTENCIA_POR_FASE: Record<FaseJuego, number> = {
  MUNICIPAL: 0.5,
  ESTATAL: 1.5,
  FEDERAL: 4.0,
};

export const FACTOR_DRENAJE_APOYO_POR_PRESION = 0.05;

/** Conversion Apoyo -> Presion por fase (GDD 12). */
export const CONVERSION_APOYO_PRESION: Record<FaseJuego, number> = {
  MUNICIPAL: 1.0,
  ESTATAL: 0.7,
  FEDERAL: 0.4,
};

// --- Rendimiento de los 4 verbos (por hora asignada) -----------------------

export const RENDIMIENTO_POR_HORA: Record<VerboAccion, number> = {
  INVESTIGAR: 0.55, // puntos de solidez tecnica
  MOVILIZAR: 0.42, // puntos de apoyo social
  CABILDEAR: 0.8, // puntos de presion politica (antes de conversion de fase)
  AUTOCUIDADO: 0.55, // puntos de resistencia
};

/** Cabildear quema capital social: cada hora consume apoyo (GDD pilar 2). */
export const COSTO_APOYO_POR_HORA_CABILDEO = 0.22;

/**
 * Rendimientos decrecientes por saturacion.
 *
 * Cada verbo rinde `base * (1 - recursoActual/100)`: los primeros puntos de
 * Apoyo Social son baratos y los ultimos carisimos; dormir cuando ya dormiste
 * no repone nada. Sin esta curva la POC se estabiliza en 100% de todo hacia la
 * semana 10 y desaparece la tension (verificado con `npm run sim`).
 */
export const PISO_SATURACION = 0.05;

/**
 * La presion politica es perecedera: sin nada agendado, los pasillos te
 * olvidan. Decae cada semana y mucho mas rapido si no hay comision activa.
 */
export const DECAIMIENTO_PRESION_BASE = 1.0;
/**
 * Sin comision activa la perdida es proporcional (12% de lo acumulado, con
 * piso de 3 puntos): impide que el jugador "embotelle" presion al 90% durante
 * los recesos y llegue a la siguiente fase resolviendola en cuatro semanas.
 */
export const PROPORCION_DECAIMIENTO_SIN_AGENDA = 0.12;
export const PISO_DECAIMIENTO_SIN_AGENDA = 3.0;

/** Bono multiplicativo cuando el especialista dedica horas a su verbo. */
export const BONO_ESPECIALISTA: Record<string, { verbo: VerboAccion; factor: number }> = {
  ABOGADA: { verbo: 'INVESTIGAR', factor: 1.6 },
  VOCERO: { verbo: 'CABILDEAR', factor: 1.5 },
  ENLACE_BASE: { verbo: 'MOVILIZAR', factor: 1.5 },
};

// --- Umbrales criticos (GUIA 4, GDD 8) -------------------------------------

export const UMBRAL_NIEBLA_MENTAL = 30;
export const UMBRAL_ALERTA_REGIMEN = 80;
export const UMBRAL_RUPTURA_INTERNA = 25;

/** Alerta del Regimen: guerra sucia mediatica (GUIA 4.B). */
export const CASTIGO_ALERTA_REGIMEN_APOYO = 15;
/** Enfriamiento en semanas para que un disparador repetible vuelva a activarse. */
export const ENFRIAMIENTO_ALERTA_REGIMEN = 8;
export const ENFRIAMIENTO_RUPTURA_INTERNA = 8;
/** Fisura interna por apoyo social bajo (GDD 8). */
export const CASTIGO_RUPTURA_INTERNA_APOYO = 4;
export const CASTIGO_RUPTURA_INTERNA_PRESION = 6;

// --- Niebla mental (GDD 9 / 11) --------------------------------------------

/** Probabilidad de friccion al cabildear con la resistencia por los suelos. */
export const PROBABILIDAD_FRICCION_NIEBLA = 0.28;
export const CASTIGO_FRICCION_APOYO = 3;
/** Sesgo pesimista aplicado a las estimaciones mostradas en pantalla. */
export const SESGO_PESIMISTA_NIEBLA = 0.65;

// --- Semana 48 (GUIA 4.A) --------------------------------------------------

export const ALIADOS_MINIMOS_SEMANA_48 = 2;
export const RECUPERACION_SEMANAL_CON_COLECTIVO = 15;
/**
 * La GUIA no fija recuperacion para el lider que llego solo a la semana 48.
 * Decision de balanceo (documentada en ARQUITECTURA.md): descansa igual, pero
 * la culpa y la parálisis del proyecto reducen el beneficio del reposo.
 */
export const RECUPERACION_SEMANAL_SIN_COLECTIVO = 5;
export const CASTIGO_APOYO_SIN_COLECTIVO = 25;
export const SEMANAS_RELOJ_PERDIDAS_SIN_COLECTIVO = 3;

// --- Congeladora y dictamen mutilado (GUIA 4.C) ----------------------------

export const RELOJ_CONGELADORA_ESTANDAR = 12;
export const UMBRAL_OFERTA_MUTILACION = 3;
export const CASTIGO_MUTILACION_APOYO = 35;
/** Penalizacion extra de reloj cuando el dictamen se devuelve por debilidad tecnica. */
export const CASTIGO_RELOJ_DICTAMEN_DEBIL = 1;

// --- Economia blanda de fondos (Bitacora #005) -----------------------------

/** Donaciones semanales proporcionales al apoyo social. */
export const FONDOS_POR_PUNTO_DE_APOYO = 25;
export const COSTO_OPERATIVO_SEMANAL = 1_200;

// --- Reclutamiento ---------------------------------------------------------

export const CAPACIDAD_HORAS_ALIADO = 20;

// --- Condicion de victoria (GDD 12) ----------------------------------------

export const VICTORIA = {
  porcentajeVotosFederales: 0.65,
  resistenciaMinima: 20,
  apoyoSocialMinimo: 35,
} as const;

/** Malus por escalar de fase sin haber ganado la instancia anterior. */
export const CASTIGO_FASE_INCOMPLETA = {
  apoyoSocial: 10,
  solidezTecnica: 10,
} as const;

// --- Event deck (GDD 13) ---------------------------------------------------

/** Probabilidad semanal de que se levante una carta del mazo de eventos. */
export const PROBABILIDAD_EVENTO_SEMANAL = 0.16;
export const ENFRIAMIENTO_EVENTO_SEMANAS = 6;
