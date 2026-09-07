/**
 * Módulo de Niebla Mental (GUIA 5.4 / GDD 9 y 11).
 *
 * Cuando la Resistencia cae por debajo del 30%:
 *  · viñeteado procedimental que oscurece los márgenes del War Room;
 *  · pensamientos intrusivos flotantes en los bordes de la pantalla;
 *  · etiqueta de la distorsión cognitiva al pasar el cursor (TCC aplicada).
 */

import { etiquetaDistorsion, pensamientosIntrusivos, type GameState } from '../../engine';

/** Anclas fijas para que los mensajes no tapen los controles centrales. */
const POSICIONES = [
  'left-4 top-28 sm:left-8',
  'right-4 top-1/2 -translate-y-1/2 sm:right-8 text-right',
  'left-6 bottom-16 sm:left-12',
  'right-8 top-32 text-right',
];

export function NieblaMental({ estado }: { estado: GameState }) {
  if (!estado.nieblaMentalActiva) return null;

  const pensamientos = pensamientosIntrusivos(estado, 3);
  // A menor resistencia, viñeta más cerrada.
  const intensidad = Math.min(1, (30 - estado.recursos.resistencia) / 30 + 0.45);

  return (
    <>
      <div className="niebla-vineta" style={{ opacity: intensidad }} aria-hidden />

      <div aria-live="polite" className="sr-only">
        Niebla mental activa: la resistencia está por debajo del 30% y las estimaciones en pantalla
        se muestran con sesgo pesimista.
      </div>

      {pensamientos.map((pensamiento, indice) => (
        <p
          key={pensamiento}
          className={`pensamiento-intrusivo animate-intrusiva ${POSICIONES[indice % POSICIONES.length]}`}
          style={{ animationDelay: `${indice * 2.6}s` }}
          title={`Distorsión cognitiva: ${etiquetaDistorsion(pensamiento)}`}
          aria-hidden
        >
          “{pensamiento}”
          <span className="mt-1 block text-[9px] uppercase tracking-[0.16em] text-opositor/45">
            {etiquetaDistorsion(pensamiento)}
          </span>
        </p>
      ))}
    </>
  );
}
