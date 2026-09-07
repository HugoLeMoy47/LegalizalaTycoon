/**
 * Superficie publica del Core Engine.
 *
 * La capa de presentacion (React) solo debe importar desde aqui.
 * Nada de lo exportado toca el DOM ni depende de un framework.
 */

export * from './types';
export * from './balance';
export * from './estado';
export * from './motor';
export * from './acciones';
export * from './legislativo';
export * from './disparadores';
export * from './selectores';
export { BANCADAS, ORDEN_BANCADAS, type FichaBancada } from './data/bancadas';
export {
  PENSAMIENTOS_INTRUSIVOS,
  ETIQUETAS_DISTORSION,
  EVENT_DECK,
  TITULARES_GACETA,
  MEDIOS_FICTICIOS,
  TOOLTIP_BANCADA,
  GLOSARIO,
  PROLOGO,
} from './data/narrativa';
export { acotar, formatearPesos, redondear } from './utilidades';
