/**
 * Prólogo Narrativo — El Incidente Incitador (GUIA v2.0 sección 2).
 *
 * Se muestra a pantalla completa antes del War Room, con diseño de ficha de
 * incidencia policial. Al aceptar, arranca el wizard de onboarding.
 */

import { AlertTriangle, FileWarning, Fingerprint, Gavel, Timer } from 'lucide-react';

import { PROLOGO, SEMANAS_TOTALES } from '../../engine';

export function PrologoModal({ onAsumir }: { onAsumir: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/90 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-prologo"
    >
      <article className="carpeta my-4 w-full max-w-2xl px-6 py-6 sm:px-8">
        {/* Cabecera del expediente */}
        <header className="border-b-2 border-pizarra-900/30 pb-3">
          <p className="flex flex-wrap items-center gap-x-2 font-oficial text-[11px] uppercase tracking-[0.16em] text-pizarra-900/70">
            <FileWarning className="h-3.5 w-3.5" aria-hidden />
            Expediente policial: {PROLOGO.expediente}
          </p>
          <p className="mt-1 font-oficial text-[11px] uppercase tracking-[0.16em] text-[#a02334]">
            Estado: {PROLOGO.estado}
          </p>
        </header>

        {/* Ficha con sello de detenido */}
        <div className="mt-5 flex items-center gap-4">
          <div className="relative flex h-24 w-20 shrink-0 items-center justify-center rounded-sm border-2 border-pizarra-900/30 bg-pizarra-900/10">
            <Fingerprint className="h-10 w-10 text-pizarra-900/30" aria-hidden />
            <span
              className="sello sello-tinta-roja absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px]"
              style={{ transform: 'translateX(-50%) rotate(-9deg)' }}
            >
              Detenido
            </span>
          </div>
          <div className="min-w-0">
            <h2 id="titulo-prologo" className="font-oficial text-xl leading-tight text-pizarra-900">
              Gael, 21 años
            </h2>
            <p className="font-oficial text-[12px] text-pizarra-900/70">
              Estudiante · Vecino de tu comunidad
            </p>
          </div>
        </div>

        <Bloque icono={AlertTriangle} titulo="Hechos">
          <p>{PROLOGO.hechos}</p>
          <p className="mt-2">{PROLOGO.extorsion}</p>
        </Bloque>

        <Bloque icono={Gavel} titulo="La epifanía">
          <p>{PROLOGO.epifania}</p>
        </Bloque>

        <Bloque icono={Timer} titulo="El mandato y el reloj">
          <p>{PROLOGO.mandato}</p>
          <p className="mt-2">{PROLOGO.reloj}</p>
        </Bloque>

        <p className="mt-5 border-l-2 border-[#a02334] pl-3 font-oficial text-[14px] italic leading-relaxed text-pizarra-900">
          {PROLOGO.pregunta}
        </p>

        <button
          type="button"
          onClick={onAsumir}
          autoFocus
          className="mt-6 w-full rounded border-2 border-pizarra-900/70 bg-pizarra-900 px-4 py-3 font-oficial text-base uppercase tracking-[0.14em] text-papel-100 transition hover:bg-pizarra-800"
        >
          ✊ {PROLOGO.boton}
        </button>

        <p className="mt-3 text-center font-oficial text-[10px] uppercase tracking-[0.14em] text-pizarra-900/45">
          {SEMANAS_TOTALES} semanas · Art. 71 fracción IV constitucional
        </p>
      </article>
    </div>
  );
}

function Bloque({
  icono: Icono,
  titulo,
  children,
}: {
  icono: typeof AlertTriangle;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="flex items-center gap-1.5 font-oficial text-[11px] uppercase tracking-[0.18em] text-pizarra-900/70">
        <Icono className="h-3.5 w-3.5" aria-hidden />
        {titulo}
      </h3>
      <div className="mt-1.5 font-oficial text-[13px] leading-relaxed text-pizarra-900/90">
        {children}
      </div>
    </section>
  );
}
