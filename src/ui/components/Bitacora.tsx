import { Newspaper } from 'lucide-react';

import type { GameState, TipoEvento } from '../../engine';

const ESTILO_TIPO: Record<TipoEvento, { punto: string; texto: string }> = {
  SISTEMA: { punto: 'bg-slate-500', texto: 'text-slate-400' },
  GACETA: { punto: 'bg-sky-600', texto: 'text-sky-400' },
  CRISIS: { punto: 'bg-opositor', texto: 'text-opositor' },
  LOGRO: { punto: 'bg-favor', texto: 'text-favor' },
  ADVERTENCIA: { punto: 'bg-alerta', texto: 'text-alerta' },
  DECISION: { punto: 'bg-papel-300', texto: 'text-papel-300' },
  DESENLACE: { punto: 'bg-papel-100', texto: 'text-papel-100' },
};

export function Bitacora({ estado }: { estado: GameState }) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <h2 className="panel-titulo">
        <Newspaper className="h-3.5 w-3.5" aria-hidden />
        Gaceta y bitácora
      </h2>

      <ol className="max-h-[22rem] flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
        {estado.registro
          .slice(-40)
          .reverse()
          .map((entrada, indice) => {
            const estilo = ESTILO_TIPO[entrada.tipo];
            return (
              <li
                key={`${entrada.semana}-${entrada.titulo}-${indice}`}
                className="relative border-l border-pizarra-600 py-2 pl-4"
              >
                <span
                  className={`absolute -left-[3.5px] top-3.5 h-1.5 w-1.5 rounded-full ${estilo.punto}`}
                  aria-hidden
                />
                <p className="flex items-baseline gap-2">
                  <span className="font-tactica text-[10px] tabular-nums text-slate-600">
                    S{entrada.semana}
                  </span>
                  <span className={`font-tactica text-[11px] font-semibold ${estilo.texto}`}>
                    {entrada.titulo}
                  </span>
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-400">{entrada.texto}</p>
              </li>
            );
          })}
      </ol>
    </section>
  );
}
