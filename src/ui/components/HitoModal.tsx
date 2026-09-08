/**
 * Anuncio de hito de progresión escalonada (GUIA v2.0 sección 5.B).
 *
 * Etapa B: "¡Nace el Colectivo Ciudadano!"
 * Etapa C: "Oficialía de Partes valida la iniciativa"
 *
 * A diferencia de `ModalDecision`, no bloquea el turno: es un acuse.
 */

import { CalendarClock, Stamp, Users } from 'lucide-react';

import type { HitoDesbloqueo } from '../../engine';

export function HitoModal({
  hito,
  onCerrar,
}: {
  hito: HitoDesbloqueo;
  onCerrar: () => void;
}) {
  const esComision = hito.id === 'COMISION_ABIERTA';
  const esReceso = hito.id === 'RECESO_ABIERTO';
  const Icono = esReceso ? CalendarClock : esComision ? Stamp : Users;
  const encabezado = esReceso
    ? 'Ventana de remediación'
    : esComision
      ? 'Etapa C · Entrada al Cabildo'
      : 'Etapa B · Cuartel del Colectivo';

  return (
    <div
      className="fixed inset-0 z-[66] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-hito"
    >
      <div className="panel w-full max-w-lg animate-aparecer border-olivo-500/60">
        <h2 className="panel-titulo border-olivo-500/40 text-olivo-400">
          <Icono className="h-3.5 w-3.5" aria-hidden />
          {encabezado}
        </h2>

        <div className="p-5">
          <h3 id="titulo-hito" className="font-tactica text-lg font-semibold leading-snug text-papel-100">
            {hito.titulo}
          </h3>

          {hito.sello && (
            <span
              className="sello sello-tinta-azul animate-sello my-4 inline-flex bg-papel-100/90"
              style={{ transform: 'rotate(-6deg)' }}
            >
              Turnado a comisión
            </span>
          )}

          <p className="mt-3 text-sm leading-relaxed text-slate-300">{hito.texto}</p>

          <ul className="mt-4 space-y-1.5 border-t border-pizarra-600/70 pt-3">
            {hito.efectos.map((efecto) => (
              <li key={efecto} className="flex gap-2 font-tactica text-[11px] leading-snug text-olivo-400">
                <span aria-hidden>▸</span>
                {efecto}
              </li>
            ))}
          </ul>

          <button type="button" className="boton boton-primario mt-5 w-full" onClick={onCerrar} autoFocus>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
