/**
 * Reporte Ejecutivo de Desempeño del Colectivo en Ausencia del Líder
 * (GUIA 4.A, GDD 9). Sobriedad de War Room, sin melodrama: un informe.
 */

import { useState } from 'react';
import { ClipboardList, X } from 'lucide-react';

import type { ReporteColectivo } from '../../engine';

export function ReporteSemana48({ reporte }: { reporte: ReporteColectivo }) {
  const [abierto, setAbierto] = useState(true);
  if (!abierto) return null;

  const sostuvo = reporte.colectivoSostuvo;

  return (
    <div
      className="fixed inset-0 z-[62] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-reporte-48"
    >
      <div className="panel w-full max-w-2xl">
        <h2 id="titulo-reporte-48" className="panel-titulo">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Informe de contingencia · Semanas 48-50
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="ml-auto rounded p-1 text-slate-500 transition hover:bg-pizarra-600 hover:text-slate-200"
            aria-label="Cerrar el informe"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </h2>

        <div className="p-5">
          <p className="etiqueta">Descanso forzado obligatorio del coordinador</p>
          <h3 className="mt-1 font-tactica text-lg font-semibold leading-snug text-papel-100">
            {sostuvo
              ? 'El colectivo sostuvo la iniciativa'
              : 'Parálisis operativa del proyecto'}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {sostuvo
              ? `Con ${reporte.aliadosActivos} perfiles activos, el liderazgo distribuido absorbió la carga durante tu inhabilitación.`
              : `El liderazgo estaba centralizado en una sola persona. Con ${reporte.aliadosActivos} perfiles activos, no hubo quién sostuviera el frente.`}
          </p>

          <ul className="mt-4 space-y-2 border-y border-pizarra-600/70 py-4">
            {reporte.lineas.map((linea) => (
              <li key={linea} className="flex gap-2 text-[13px] leading-snug text-slate-300">
                <span className={sostuvo ? 'text-favor' : 'text-opositor'} aria-hidden>
                  {sostuvo ? '✓' : '✕'}
                </span>
                {linea}
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Metrica
              etiqueta="Reloj legislativo"
              valor={reporte.impactoRelojSemanas === 0 ? 'Detenido' : `${reporte.impactoRelojSemanas} sem.`}
              positivo={reporte.impactoRelojSemanas === 0}
            />
            <Metrica
              etiqueta="Apoyo social"
              valor={reporte.impactoApoyoSocial === 0 ? 'Sin cambio' : `${reporte.impactoApoyoSocial}%`}
              positivo={reporte.impactoApoyoSocial === 0}
            />
            <Metrica
              etiqueta="Recuperación"
              valor={`+${reporte.impactoResistencia}%`}
              positivo={sostuvo}
            />
          </dl>

          <p className="mt-5 border-l-2 border-olivo-500 pl-3 text-[13px] italic leading-relaxed text-olivo-400">
            Cuidarse no es deserción; es una responsabilidad estratégica hacia el movimiento.
          </p>

          <button
            type="button"
            className="boton boton-primario mt-5 w-full"
            onClick={() => setAbierto(false)}
          >
            Acuse de recibido
          </button>
        </div>
      </div>
    </div>
  );
}

function Metrica({
  etiqueta,
  valor,
  positivo,
}: {
  etiqueta: string;
  valor: string;
  positivo: boolean;
}) {
  return (
    <div className="rounded border border-pizarra-600 bg-pizarra-900/50 p-2.5">
      <p className="etiqueta">{etiqueta}</p>
      <p
        className={`mt-1 font-tactica text-sm font-semibold ${
          positivo ? 'text-favor' : 'text-opositor'
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
