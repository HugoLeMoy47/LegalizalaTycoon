/**
 * Pop-up de la Gaceta Semanal (GUIA v2.0 sección 4.B).
 *
 * Recorte de prensa matutina con el titular satírico de la semana. Sin efecto
 * mecánico: es retórica de medios. Se cierra con el botón o con Escape.
 */

import { useEffect } from 'react';
import { Newspaper, X } from 'lucide-react';

import type { FaseJuego, TitularGaceta } from '../../engine';

const SECCION_POR_FASE: Record<FaseJuego, string> = {
  MUNICIPAL: 'Sección Local',
  ESTATAL: 'Sección Estados',
  FEDERAL: 'Sección Nacional',
};

export function GacetaPopup({
  gaceta,
  onCerrar,
}: {
  gaceta: TitularGaceta;
  onCerrar: () => void;
}) {
  useEffect(() => {
    const teclas = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  }, [onCerrar]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[68] flex justify-center px-4">
      <article
        className="carpeta pointer-events-auto w-full max-w-md animate-aparecer px-5 py-4"
        role="status"
        aria-live="polite"
      >
        <header className="flex items-start justify-between gap-3 border-b border-pizarra-900/25 pb-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-oficial text-[11px] uppercase tracking-[0.18em] text-pizarra-900/70">
              <Newspaper className="h-3.5 w-3.5" aria-hidden />
              {gaceta.medio}
            </p>
            <p className="font-oficial text-[10px] uppercase tracking-[0.14em] text-pizarra-900/45">
              {SECCION_POR_FASE[gaceta.fase]} · Semana {gaceta.semana}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar la gaceta"
            className="shrink-0 rounded p-1 text-pizarra-900/50 transition hover:bg-pizarra-900/10 hover:text-pizarra-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <p className="mt-3 font-oficial text-[15px] leading-snug text-pizarra-900">
          {gaceta.titular}
        </p>
      </article>
    </div>
  );
}
