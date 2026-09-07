/**
 * Micro-animación de transición entre semanas (GUIA v2.0 sección 4.A).
 *
 * 1. Bloqueo breve de interfaz (600 ms) para evitar el doble clic.
 * 2. Sello burocrático flotante con rotación aleatoria y golpe de madera.
 * 3. Deltas (+/-) flotando hacia arriba en verde/rojo/ámbar.
 */

import { useEffect, useMemo, useState } from 'react';

import type {
  FaseJuego,
  MotivoParada,
  RegistroEvento,
  ResumenAvance,
  ResumenTurno,
  TipoEvento,
} from '../../engine';

const COLOR_SUCESO: Record<TipoEvento, string> = {
  SISTEMA: 'text-slate-300',
  GACETA: 'text-sky-400',
  CRISIS: 'text-opositor',
  LOGRO: 'text-favor',
  ADVERTENCIA: 'text-alerta',
  DECISION: 'text-papel-200',
  DESENLACE: 'text-papel-100',
};

const MOTIVO: Record<MotivoParada, string> = {
  DECISION: 'Hay un dilema sobre la mesa',
  HITO: 'Se abrió una etapa nueva',
  CAMBIO_DE_FASE: 'Cambió el orden de gobierno',
  CAMBIO_DE_ESTADO: 'Cambió el estado de la partida',
  EVENTO: 'Algo requiere tu atención',
  LIMITE: 'Pausa de control',
};

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
  /** Resumen de la corrida cuando abarcó varias semanas. */
  avance?: ResumenAvance | null;
  /** Sucesos notables ocurridos durante la corrida. */
  sucesos?: RegistroEvento[];
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
  avance,
  sucesos = [],
  onFinalizar,
}: Props) {
  const [visible, setVisible] = useState(true);

  // Rotación estable por semana: no cambia entre renders del mismo turno.
  const rotacion = useMemo(() => ((semanaEntrante * 37) % 9) - 4, [semanaEntrante]);

  useEffect(() => {
    const extra = sucesos.length > 0 ? 1600 : 0;
    const t = setTimeout(() => {
      setVisible(false);
      onFinalizar();
    }, DURACION_TRANSICION_MS + 900 + extra);
    return () => clearTimeout(t);
  }, [onFinalizar, sucesos.length]);

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
      className="pointer-events-none fixed inset-0 z-[58] flex flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      {/* Sello de semana */}
      <div
        className="sello sello-tinta-roja animate-sello bg-papel-100/95 px-6 py-3 text-center text-[15px] sm:text-[18px]"
        style={{ transform: `rotate(${rotacion}deg)` }}
      >
        {avance && avance.semanasCorridas > 1
          ? `Semanas ${avance.semanaInicio}-${avance.semanaFin - 1} de ${totalSemanas}`
          : `Semana ${semanaEntrante} de ${totalSemanas}`}{' — Fase '}
        {NOMBRE_FASE[resumen.fase].toUpperCase()}
      </div>

      {avance && avance.semanasCorridas > 1 && (
        <p className="animate-delta -mt-3 font-tactica text-[11px] uppercase tracking-[0.14em] text-slate-400">
          {avance.semanasCorridas} semanas corridas · {MOTIVO[avance.motivo]}
        </p>
      )}

      {/*
       * Qué pasó durante la corrida. Sin esto los sucesos quedaban enterrados
       * en la bitácora y el jugador avanzaba sin enterarse de nada.
       */}
      {sucesos.length > 0 && (
        <ul className="mx-auto max-w-md space-y-1 px-6">
          {sucesos.slice(0, 4).map((suceso, indice) => (
            <li
              key={`${suceso.semana}-${suceso.titulo}`}
              className="animate-delta flex items-baseline gap-2 rounded bg-pizarra-900/80 px-3 py-1.5 text-left"
              style={{ animationDelay: `${indice * 110}ms`, animationFillMode: 'both' }}
            >
              <span className="font-tactica text-[10px] tabular-nums text-slate-500">
                S{suceso.semana}
              </span>
              <span className={`font-tactica text-[11px] font-semibold ${COLOR_SUCESO[suceso.tipo]}`}>
                {suceso.titulo}
              </span>
            </li>
          ))}
          {sucesos.length > 4 && (
            <li className="animate-delta text-center font-tactica text-[10px] uppercase tracking-[0.14em] text-olivo-400">
              +{sucesos.length - 4} más en la bitácora
            </li>
          )}
        </ul>
      )}

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
