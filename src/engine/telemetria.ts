/**
 * TELEMETRÍA Y LEARNING ANALYTICS (GUIA v2.2 sección 6).
 *
 * El motor solo acumula eventos anónimos dentro del propio `GameState`. No
 * hace red, no toca `console` y no lee el reloj: eso rompería la pureza y el
 * determinismo por semilla que sostiene toda la suite de pruebas.
 *
 * El sumidero vive en la capa de presentación (`useJuego`), que drena la cola,
 * estampa el `timestamp` y decide si los imprime o los envía. Aquí no hay ni
 * un identificador de jugador ni texto libre: solo el hito, la semana y la
 * foto de recursos.
 */

import type { EventoTelemetria, GameState, NombreEventoTelemetria } from './types';
import { redondear } from './utilidades';

/** Registra un hito del embudo cívico. No emite el mismo evento dos veces. */
export function emitir(
  estado: GameState,
  evento: NombreEventoTelemetria,
  metadata?: EventoTelemetria['metadata'],
): void {
  if (estado.telemetria.some((e) => e.evento === evento)) return;

  estado.telemetria.push({
    evento,
    semana: estado.semanaActual,
    recursos: {
      apoyo: redondear(estado.recursos.apoyoSocial, 1),
      presion: redondear(estado.recursos.presionPolitica, 1),
      resistencia: redondear(estado.recursos.resistencia, 1),
      fondos: estado.recursos.fondos,
    },
    ...(metadata ? { metadata } : {}),
    // Lo estampa el sumidero de la UI: el motor no lee el reloj del sistema.
    timestamp: 0,
  });
}

/** Eventos aún no entregados al sumidero. */
export function telemetriaPendiente(
  estado: GameState,
  yaEntregados: number,
): EventoTelemetria[] {
  return estado.telemetria.slice(yaEntregados);
}
