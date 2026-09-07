/**
 * Estado bloqueado de un panel durante el early game (GUIA v2.0 sección 5.B).
 *
 * No oculta el panel: lo muestra con candado y explica qué falta y cuándo se
 * abre. El jugador debe poder ver el mapa completo del juego desde el día 1;
 * lo que no puede es actuar sobre él todavía.
 */

import { Lock } from 'lucide-react';

interface Props {
  titulo: string;
  icono: React.ReactNode;
  motivo: string;
  semanaApertura: number;
  semanaActual: number;
}

export function PanelBloqueado({ titulo, icono, motivo, semanaApertura, semanaActual }: Props) {
  const faltan = Math.max(0, semanaApertura - semanaActual);

  return (
    <section className="panel opacity-80">
      <h2 className="panel-titulo">
        {icono}
        {titulo}
        <Lock className="ml-auto h-3.5 w-3.5 text-slate-600" aria-hidden />
      </h2>

      <div className="flex flex-col items-center px-5 py-8 text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-pizarra-600 bg-pizarra-900">
          <Lock className="h-5 w-5 text-slate-600" aria-hidden />
        </span>

        <p className="font-tactica text-[12px] font-semibold text-slate-400">{motivo}</p>

        <p className="mt-2 text-[11px] leading-snug text-slate-600">
          {faltan > 0
            ? `Se abre en la semana ${semanaApertura} · faltan ${faltan} ${faltan === 1 ? 'semana' : 'semanas'}`
            : `Se abre en la semana ${semanaApertura}`}
        </p>
      </div>
    </section>
  );
}
