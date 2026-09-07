/**
 * Sistema de Progresión Dual Intercambiable (Bitácora #007):
 * el jugador conmuta en todo momento entre el expediente físico y el mapa
 * táctico de nodos.
 */

import { useEffect, useState } from 'react';
import { FolderOpen, Workflow } from 'lucide-react';

import { progresoRuta, type GameState } from '../../engine';
import { ExpedienteFisico } from './ExpedienteFisico';
import { MapaNodos } from './MapaNodos';

type Vista = 'EXPEDIENTE' | 'NODOS';
const CLAVE_VISTA = 'iniciativa-ciudadana:vista';

export function VistaDual({ estado }: { estado: GameState }) {
  const [vista, setVista] = useState<Vista>(() => {
    try {
      return (localStorage.getItem(CLAVE_VISTA) as Vista | null) ?? 'EXPEDIENTE';
    } catch {
      return 'EXPEDIENTE';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_VISTA, vista);
    } catch {
      /* preferencia no persistida: no es crítico */
    }
  }, [vista]);

  const progreso = progresoRuta(estado);

  return (
    <section className="panel overflow-hidden">
      <div data-tour="vista-dual" className="flex items-center gap-1 border-b border-pizarra-600/70 px-3 py-2">
        <Pestaña
          activa={vista === 'EXPEDIENTE'}
          onClick={() => setVista('EXPEDIENTE')}
          icono={<FolderOpen className="h-3.5 w-3.5" aria-hidden />}
          texto="Expediente físico"
        />
        <Pestaña
          activa={vista === 'NODOS'}
          onClick={() => setVista('NODOS')}
          icono={<Workflow className="h-3.5 w-3.5" aria-hidden />}
          texto="Mapa de nodos"
        />

        <span className="ml-auto pr-1 font-tactica text-[10px] tabular-nums text-slate-500">
          Ruta: {progreso.aprobados}/{progreso.total} etapas
        </span>
      </div>

      {vista === 'EXPEDIENTE' ? (
        <ExpedienteFisico estado={estado} />
      ) : (
        <MapaNodos estado={estado} />
      )}
    </section>
  );
}

function Pestaña({
  activa,
  onClick,
  icono,
  texto,
}: {
  activa: boolean;
  onClick: () => void;
  icono: React.ReactNode;
  texto: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-tactica text-[11px] uppercase tracking-[0.12em] transition ${
        activa
          ? 'bg-pizarra-600 text-papel-100'
          : 'text-slate-500 hover:bg-pizarra-700 hover:text-slate-300'
      }`}
    >
      {icono}
      {texto}
    </button>
  );
}
