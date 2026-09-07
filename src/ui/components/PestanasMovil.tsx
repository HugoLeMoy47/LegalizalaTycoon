/**
 * Navegación por pestañas para móvil.
 *
 * En 375 px el tablero apilado medía 3 593 px — 4.4 pantallas de scroll por
 * turno, con el botón de avanzar semana a 3 528 px del inicio. Las pestañas
 * reducen cada vista a una pantalla y permiten fijar el estado arriba y la
 * acción abajo.
 */

import { FileText, Lock, Newspaper, SlidersHorizontal, Vote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PestanaMovil = 'OPERACION' | 'COMISION' | 'EXPEDIENTE' | 'BITACORA';

interface Ficha {
  id: PestanaMovil;
  etiqueta: string;
  icono: LucideIcon;
}

const PESTANAS: Ficha[] = [
  { id: 'OPERACION', etiqueta: 'Operación', icono: SlidersHorizontal },
  { id: 'COMISION', etiqueta: 'Comisión', icono: Vote },
  { id: 'EXPEDIENTE', etiqueta: 'Expediente', icono: FileText },
  { id: 'BITACORA', etiqueta: 'Bitácora', icono: Newspaper },
];

interface Props {
  activa: PestanaMovil;
  onCambiar: (pestana: PestanaMovil) => void;
  /** Pestañas con acción pendiente esta semana; se marcan con un punto. */
  conPendiente?: PestanaMovil[];
  /** Novedades sin leer por pestaña; se pintan como contador. */
  novedades?: Partial<Record<PestanaMovil, number>>;
  /**
   * Pestañas cuyo contenido aún no se desbloquea. **Siguen siendo navegables**:
   * el panel de adentro explica el candado y en qué semana se abre. Impedir la
   * entrada hacía que tocar la pestaña pareciera un error de la aplicación.
   */
  bloqueadas?: PestanaMovil[];
}

export function PestanasMovil({
  activa,
  onCambiar,
  conPendiente = [],
  bloqueadas = [],
  novedades = {},
}: Props) {
  return (
    <nav
      data-tour="pestanas"
      className="flex border-b border-pizarra-600/70 bg-pizarra-800/95"
      role="tablist"
      aria-label="Secciones del tablero"
    >
      {PESTANAS.map(({ id, etiqueta, icono: Icono }) => {
        const esActiva = id === activa;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={esActiva}
            onClick={() => onCambiar(id)}
            className={`pestana-movil ${esActiva ? 'pestana-movil-activa' : 'pestana-movil-inactiva'}`}
          >
            <span className="relative">
              {bloqueadas.includes(id) ? (
                <Lock className="h-4 w-4 opacity-60" aria-hidden />
              ) : (
                <Icono className="h-4 w-4" aria-hidden />
              )}
              {(novedades[id] ?? 0) > 0 && !esActiva ? (
                <span
                  className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-olivo-500 px-1 font-tactica text-[9px] font-semibold text-papel-100"
                  aria-label={`${novedades[id]} novedades sin leer`}
                >
                  {novedades[id]}
                </span>
              ) : (
                conPendiente.includes(id) &&
                !esActiva && (
                  <span
                    className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-olivo-400"
                    aria-label="Tiene acciones pendientes"
                  />
                )
              )}
            </span>
            {/* La etiqueta siempre visible: un icono solo no le dice nada a
                quien juega por primera vez, que es justo el problema que
                reportó el playtest. */}
            <span className="truncate text-[9px] xs:text-[11px]">{etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
