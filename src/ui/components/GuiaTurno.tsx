/**
 * Guía de turno: los pasos 1-2-3 de la semana.
 *
 * Responde a la retroalimentación de playtest ("me sentí perdido"). A
 * diferencia del wizard, que se ve una sola vez, esto está siempre presente y
 * refleja el estado real: marca lo hecho, oculta lo que no aplica y dice en una
 * línea qué toca ahora.
 *
 * La lógica de los pasos vive en `selectores.ts` — aquí solo se pinta.
 */

import { Check } from 'lucide-react';

import { pasosDelTurno, type GameState } from '../../engine';

export function GuiaTurno({ estado, compacta = false }: { estado: GameState; compacta?: boolean }) {
  const pasos = pasosDelTurno(estado);
  const pendiente = pasos.find((p) => p.disponible && !p.hecho);

  return (
    <div data-tour="guia-turno" className={compacta ? '' : 'panel px-4 py-2.5'}>
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {pasos.map((paso) => {
          const esActual = paso.id === pendiente?.id;
          const atenuado = !paso.disponible;

          return (
            <li
              key={paso.id}
              className={`flex items-center gap-1.5 font-tactica text-[11px] transition ${
                atenuado
                  ? 'text-slate-700 line-through'
                  : paso.hecho
                    ? 'text-favor'
                    : esActual
                      ? 'text-papel-100'
                      : 'text-slate-500'
              }`}
              aria-current={esActual ? 'step' : undefined}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                  paso.hecho
                    ? 'bg-favor text-pizarra-900'
                    : esActual
                      ? 'bg-olivo-500 text-papel-100'
                      : 'bg-pizarra-600 text-slate-400'
                }`}
                aria-hidden
              >
                {paso.hecho ? <Check className="h-2.5 w-2.5" /> : paso.numero}
              </span>
              {paso.etiqueta}
            </li>
          );
        })}
      </ol>

      {pendiente && (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-400">{pendiente.pista}</p>
      )}
    </div>
  );
}
