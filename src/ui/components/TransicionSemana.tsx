/**
 * Micro-animación de transición entre semanas (GUIA v2.0 sección 4.A).
 *
 * 1. Bloqueo breve de interfaz (600 ms) para evitar el doble clic.
 * 2. Sello burocrático flotante con rotación aleatoria y golpe de madera.
 * 3. Deltas (+/-) flotando hacia arriba en verde/rojo/ámbar.
 */

import { useEffect, useMemo, useState } from 'react';

import type { FaseJuego, ResumenTurno } from '../../engine';

export const DURACION_TRANSICION_MS = 600;

const NOMBRE_FASE: Record<FaseJuego, string> = {
  MUNICIPAL: 'Municipal',
  ESTATAL: 'Estatal',
  FEDERAL: 'Federal',
};

interface Delta {
  etiqueta: string;
  valor: number;
  /** 'positivo-bueno': subir es bueno. 'neutro': informativo (ámbar). */
  signo: 'positivo-bueno' | 'neutro';
  sufijo: string;
}

interface Props {
  resumen: ResumenTurno;
  semanaEntrante: number;
  totalSemanas: number;
  /** Semanas restantes del reloj de la congeladora, si está corriendo. */
  relojCongeladora: number | null;
  /**
   * Se llama al terminar la animación. Sin esto la transición quedaría marcada
   * como activa para siempre y bloquearía el pop-up de la Gaceta.
   */
  onFinalizar: () => void;
}

export function TransicionSemana({
  resumen,
  semanaEntrante,
  totalSemanas,
  relojCongeladora,
  onFinalizar,
}: Props) {
  const [visible, setVisible] = useState(true);

  // Rotación estable por semana: no cambia entre renders del mismo turno.
  const rotacion = useMemo(() => ((semanaEntrante * 37) % 9) - 4, [semanaEntrante]);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onFinalizar();
    }, DURACION_TRANSICION_MS + 900);
    return () => clearTimeout(t);
  }, [onFinalizar]);

  if (!visible) return null;

  const deltas: Delta[] = ([
    { etiqueta: 'Apoyo', valor: resumen.deltaApoyoSocial, signo: 'positivo-bueno', sufijo: '%' },
    { etiqueta: 'Presión', valor: resumen.deltaPresionPolitica, signo: 'positivo-bueno', sufijo: '%' },
    {
      etiqueta: 'Resistencia',
      valor: resumen.deltaResistencia,
      signo: 'positivo-bueno',
      sufijo: '%',
    },
    { etiqueta: 'Solidez', valor: resumen.deltaSolidezTecnica, signo: 'positivo-bueno', sufijo: '%' },
    { etiqueta: 'Firmas', valor: resumen.deltaFirmas, signo: 'positivo-bueno', sufijo: '' },
  ] as Delta[]).filter((d) => Math.abs(d.valor) >= 0.1);

  if (relojCongeladora !== null) {
    deltas.push({ etiqueta: 'Congeladora', valor: -1, signo: 'neutro', sufijo: ' sem' });
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[75] flex flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      {/* Sello de semana */}
      <div
        className="sello sello-tinta-roja animate-sello bg-papel-100/95 px-6 py-3 text-center text-[15px] sm:text-[18px]"
        style={{ transform: `rotate(${rotacion}deg)` }}
      >
        Semana {semanaEntrante} de {totalSemanas} — Fase {NOMBRE_FASE[resumen.fase].toUpperCase()}
      </div>

      {/* Deltas flotantes */}
      {deltas.length > 0 && (
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6">
          {deltas.map((delta, indice) => (
            <li
              key={delta.etiqueta}
              className="animate-delta font-tactica text-sm font-semibold tabular-nums"
              style={{ animationDelay: `${indice * 90}ms` }}
            >
              <span className={colorDelta(delta)}>
                {delta.valor > 0 ? '+' : ''}
                {formatear(delta.valor)}
                {delta.sufijo} {delta.etiqueta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function colorDelta(delta: Delta): string {
  if (delta.signo === 'neutro') return 'text-indeciso';
  return delta.valor > 0 ? 'text-favor' : 'text-opositor';
}

function formatear(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}
