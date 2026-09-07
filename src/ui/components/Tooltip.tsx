/**
 * Tarjeta informativa contextual (GUIA v2.0 sección 4.C).
 *
 * Funciona con hover, con foco de teclado y con toque en móvil (el `button`
 * alterna la visibilidad), para que la explicación no quede fuera del alcance
 * de quien no usa ratón.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  /** Texto explicativo. */
  contenido: string;
  /** Encabezado opcional de la tarjeta. */
  titulo?: string;
  /** Contenido que dispara el tooltip. Si se omite, se usa un icono de ayuda. */
  children?: React.ReactNode;
  /** Alineación de la tarjeta respecto al disparador. */
  posicion?: 'arriba' | 'abajo';
  className?: string;
}

export function Tooltip({
  contenido,
  titulo,
  children,
  posicion = 'arriba',
  className = '',
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Cierra al tocar fuera (caso táctil) o al presionar Escape.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const escape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  return (
    <span ref={contenedor} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-describedby={abierto ? id : undefined}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        onMouseEnter={() => setAbierto(true)}
        onMouseLeave={() => setAbierto(false)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        className="inline-flex cursor-help items-center gap-1 text-left"
      >
        {children ?? (
          <HelpCircle
            className="h-3 w-3 shrink-0 text-slate-500 transition hover:text-olivo-400"
            aria-label="Más información"
          />
        )}
      </button>

      {abierto && (
        <span
          id={id}
          role="tooltip"
          className={`absolute left-1/2 z-[80] w-60 -translate-x-1/2 rounded-md border border-pizarra-500 bg-pizarra-900 px-3 py-2 text-left shadow-xl shadow-black/60 ${
            posicion === 'arriba' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {titulo && (
            <span className="mb-1 block font-tactica text-[10px] uppercase tracking-[0.14em] text-olivo-400">
              {titulo}
            </span>
          )}
          <span className="block text-[11px] leading-snug text-slate-300">{contenido}</span>
        </span>
      )}
    </span>
  );
}
