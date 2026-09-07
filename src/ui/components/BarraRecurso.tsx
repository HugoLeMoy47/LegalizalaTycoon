import type { LucideIcon } from 'lucide-react';

import { nivelRecurso } from '../../engine';

interface Props {
  etiqueta: string;
  valor: number;
  icono: LucideIcon;
  /** 'apoyo' azul, 'presion' naranja, 'resistencia' verde→rojo según nivel. */
  tono: 'apoyo' | 'presion' | 'resistencia' | 'solidez';
  delta?: number;
  ayuda?: string;
  umbral?: { valor: number; etiqueta: string };
}

const TONOS: Record<Props['tono'], string> = {
  apoyo: 'bg-sky-500',
  presion: 'bg-alerta',
  resistencia: 'bg-favor',
  solidez: 'bg-papel-300',
};

function colorBarra(tono: Props['tono'], valor: number): string {
  if (tono !== 'resistencia') return TONOS[tono];
  const nivel = nivelRecurso(valor);
  if (nivel === 'CRITICO') return 'bg-opositor animate-pulso-rojo';
  if (nivel === 'BAJO') return 'bg-indeciso';
  return 'bg-favor';
}

export function BarraRecurso({ etiqueta, valor, icono: Icono, tono, delta, ayuda, umbral }: Props) {
  const acotado = Math.max(0, Math.min(100, valor));
  const signo = delta !== undefined && delta > 0 ? '+' : '';

  return (
    <div className="min-w-0" title={ayuda}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1.5 truncate font-tactica text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <Icono className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {etiqueta}
        </span>
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-tactica text-sm font-semibold tabular-nums text-slate-100">
            {Math.round(acotado)}%
          </span>
          {delta !== undefined && Math.abs(delta) >= 0.1 && (
            <span
              className={`font-tactica text-[10px] tabular-nums ${
                delta > 0 ? 'text-favor' : 'text-opositor'
              }`}
            >
              {signo}
              {delta.toFixed(1)}
            </span>
          )}
        </span>
      </div>

      <div
        className="relative h-2 overflow-hidden rounded-full bg-pizarra-900"
        role="meter"
        aria-label={etiqueta}
        aria-valuenow={Math.round(acotado)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${colorBarra(tono, acotado)}`}
          style={{ width: `${acotado}%` }}
        />
        {umbral && (
          <span
            className="absolute top-0 h-full w-px bg-slate-300/60"
            style={{ left: `${umbral.valor}%` }}
            title={umbral.etiqueta}
          />
        )}
      </div>
    </div>
  );
}
