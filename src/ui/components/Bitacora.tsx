import { useEffect } from 'react';
import { Newspaper, Sparkles } from 'lucide-react';

import {
  esEventoNotable,
  eventosSinLeer,
  type ComandoJuego,
  type GameState,
  type TipoEvento,
} from '../../engine';

const ESTILO_TIPO: Record<TipoEvento, { punto: string; texto: string }> = {
  SISTEMA: { punto: 'bg-slate-500', texto: 'text-slate-400' },
  GACETA: { punto: 'bg-sky-600', texto: 'text-sky-400' },
  CRISIS: { punto: 'bg-opositor', texto: 'text-opositor' },
  LOGRO: { punto: 'bg-favor', texto: 'text-favor' },
  ADVERTENCIA: { punto: 'bg-alerta', texto: 'text-alerta' },
  DECISION: { punto: 'bg-papel-300', texto: 'text-papel-300' },
  DESENLACE: { punto: 'bg-papel-100', texto: 'text-papel-100' },
};

interface Props {
  estado: GameState;
  despachar?: (comando: ComandoJuego) => void;
  /**
   * Marca las entradas como vistas al montarse. En móvil se activa al abrir
   * la pestaña; en escritorio la bitácora está siempre visible, así que las
   * novedades se limpian solas al avanzar la semana.
   */
  marcarLeidasAlVer?: boolean;
}

export function Bitacora({ estado, despachar, marcarLeidasAlVer = false }: Props) {
  const desde = estado.registroLeidoHasta ?? 0;
  const sinLeer = eventosSinLeer(estado).length;

  useEffect(() => {
    if (marcarLeidasAlVer && sinLeer > 0) despachar?.({ tipo: 'MARCAR_BITACORA_LEIDA' });
    // Solo al abrir la sección, no en cada cambio de estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcarLeidasAlVer]);

  return (
    <section className="panel flex min-h-0 flex-col">
      <h2 className="panel-titulo">
        <Newspaper className="h-3.5 w-3.5" aria-hidden />
        Gaceta y bitácora
        {sinLeer > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-olivo-600/40 px-2 py-0.5 font-tactica text-[10px] normal-case tracking-normal text-olivo-400">
            <Sparkles className="h-3 w-3" aria-hidden />
            {sinLeer} {sinLeer === 1 ? 'novedad' : 'novedades'}
          </span>
        )}
      </h2>

      <ol className="max-h-[22rem] flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
        {estado.registro
          .map((entrada, indice) => ({ entrada, indice }))
          .slice(-40)
          .reverse()
          .map(({ entrada, indice }) => {
            const estilo = ESTILO_TIPO[entrada.tipo];
            const esNuevo = indice >= desde && esEventoNotable(entrada);

            return (
              <li
                key={`${entrada.semana}-${indice}`}
                className={`relative border-l py-2 pl-4 transition ${
                  esNuevo
                    ? '-ml-2 rounded-r border-l-2 border-olivo-400 bg-olivo-600/10 pl-5 pr-2'
                    : 'border-pizarra-600'
                }`}
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
                  {esNuevo && (
                    <span className="ml-auto shrink-0 font-tactica text-[9px] uppercase tracking-wider text-olivo-400">
                      nuevo
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-400">{entrada.texto}</p>
              </li>
            );
          })}
      </ol>
    </section>
  );
}
