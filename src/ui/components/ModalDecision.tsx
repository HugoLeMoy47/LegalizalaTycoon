import { AlertTriangle } from 'lucide-react';

import type { ComandoJuego, Decision } from '../../engine';

interface Props {
  decision: Decision;
  despachar: (comando: ComandoJuego) => void;
}

export function ModalDecision({ decision, despachar }: Props) {
  return (
    <div
      className="fixed inset-0 z-[64] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-dilema"
    >
      <div className="panel w-full max-w-2xl border-alerta/50">
        <h2
          id="titulo-dilema"
          className="panel-titulo border-alerta/40 text-alerta"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Decisión sobre la mesa
        </h2>

        <div className="p-5">
          <h3 className="font-tactica text-lg font-semibold leading-snug text-papel-100">
            {decision.titulo}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{decision.texto}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {decision.opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() => despachar({ tipo: 'RESOLVER_DECISION', opcionId: opcion.id })}
                className="group rounded-lg border border-pizarra-500 bg-pizarra-700/60 p-4 text-left transition hover:border-olivo-400 hover:bg-pizarra-600/70"
              >
                <p className="font-tactica text-sm font-semibold text-papel-100">
                  {opcion.etiqueta}
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-slate-400">
                  {opcion.descripcion}
                </p>
                <ul className="mt-3 space-y-1 border-t border-pizarra-600 pt-2">
                  {opcion.consecuencias.map((consecuencia) => (
                    <li
                      key={consecuencia}
                      className="font-tactica text-[10px] leading-snug text-slate-500"
                    >
                      · {consecuencia}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <p className="mt-4 text-center font-tactica text-[10px] uppercase tracking-[0.14em] text-slate-600">
            No puedes avanzar la semana sin resolver esto
          </p>
        </div>
      </div>
    </div>
  );
}
