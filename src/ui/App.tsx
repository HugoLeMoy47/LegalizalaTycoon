/**
 * CAPA DE PRESENTACIÓN — Tablero War Room.
 *
 * Este componente no contiene ni una sola regla de juego: lee `GameState`
 * y despacha comandos al Core Engine (principio de Lógica Pura Desacoplada,
 * GUIA sección 1 y Bitácora #010).
 */

import { ChevronRight, Info, RotateCcw, Target } from 'lucide-react';

import { checklistVictoria, SEMANAS_TOTALES } from '../engine';
import { Bitacora } from './components/Bitacora';
import { Dashboard } from './components/Dashboard';
import { ModalDecision } from './components/ModalDecision';
import { NieblaMental } from './components/NieblaMental';
import { PanelColectivo } from './components/PanelColectivo';
import { PanelComisiones } from './components/PanelComisiones';
import { PanelHoras } from './components/PanelHoras';
import { PantallaDesenlace } from './components/PantallaDesenlace';
import { ReporteSemana48 } from './components/ReporteSemana48';
import { VistaDual } from './components/VistaDual';
import { useJuego } from './hooks/useJuego';

export function App() {
  const { estado, despachar, reiniciar, avisos, enJuego } = useJuego();
  const mostrarReporte48 =
    estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48' &&
    estado.reporteSemana48?.semanaEmision === estado.semanaActual;

  return (
    <div className="relative min-h-screen">
      <NieblaMental estado={estado} />

      <div
        className={`relative z-10 mx-auto max-w-[1500px] px-3 py-4 sm:px-5 ${
          estado.nieblaMentalActiva ? 'texto-desenfocado' : ''
        }`}
      >
        <BarraSuperior reiniciar={reiniciar} />

        <div className="mt-3 space-y-3">
          <Dashboard estado={estado} />

          {/* Progresión legislativa dual: a todo lo ancho, el mapa de nodos
              y el expediente necesitan espacio para leerse. */}
          <VistaDual estado={estado} />

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* Columna 1 — operación semanal */}
            <div className="space-y-3">
              <PanelHoras estado={estado} despachar={despachar} />
              <PanelColectivo estado={estado} despachar={despachar} />
            </div>

            {/* Columna 2 — comisión activa y semáforo parlamentario */}
            <PanelComisiones estado={estado} despachar={despachar} />

            {/* Columna 3 — inteligencia */}
            <div className="space-y-3">
              <PanelObjetivo estado={estado} />
              <Bitacora estado={estado} />
            </div>
          </div>

          <BarraAvanzar estado={estado} despachar={despachar} enJuego={enJuego} />
        </div>
      </div>

      {estado.decisionPendiente && (
        <ModalDecision decision={estado.decisionPendiente} despachar={despachar} />
      )}
      {mostrarReporte48 && estado.reporteSemana48 && (
        <ReporteSemana48 reporte={estado.reporteSemana48} />
      )}
      {!enJuego && <PantallaDesenlace estado={estado} reiniciar={reiniciar} />}

      {/* Avisos de comandos rechazados */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[65] w-full max-w-md -translate-x-1/2 space-y-2 px-4">
        {avisos.map((aviso) => (
          <p
            key={aviso.id}
            role="status"
            className="rounded border border-alerta/50 bg-pizarra-800 px-3 py-2 text-center font-tactica text-[12px] text-alerta shadow-lg shadow-black/50"
          >
            {aviso.texto}
          </p>
        ))}
      </div>
    </div>
  );
}

function BarraSuperior({ reiniciar }: { reiniciar: () => void }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h1 className="font-tactica text-sm font-semibold uppercase tracking-[0.22em] text-papel-100">
          Iniciativa Ciudadana: Mandato de Ley
        </h1>
        <p className="font-tactica text-[10px] uppercase tracking-[0.16em] text-slate-600">
          Activismo Tycoon · War Room · Regulación Integral del Cannabis
        </p>
      </div>
      <button
        type="button"
        className="boton"
        onClick={() => {
          if (confirm('¿Reiniciar la partida? Se perderá el avance guardado.')) reiniciar();
        }}
      >
        <RotateCcw className="h-3 w-3" aria-hidden />
        Reiniciar
      </button>
    </div>
  );
}

function PanelObjetivo({ estado }: { estado: ReturnType<typeof useJuego>['estado'] }) {
  const checklist = checklistVictoria(estado);

  return (
    <section className="panel">
      <h2 className="panel-titulo">
        <Target className="h-3.5 w-3.5" aria-hidden />
        Condición de victoria
      </h2>
      <div className="p-4">
        <p className="text-[12px] leading-relaxed text-slate-400">
          Promulgar la reforma en el Diario Oficial de la Federación antes de la semana{' '}
          {SEMANAS_TOTALES}, con integridad técnica y ética.
        </p>
        <ul className="mt-3 space-y-1.5">
          {checklist.map((requisito) => (
            <li
              key={requisito.etiqueta}
              className={`flex items-center gap-2 font-tactica text-[11px] ${
                requisito.cumplido ? 'text-favor' : 'text-slate-500'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  requisito.cumplido ? 'bg-favor' : 'bg-slate-600'
                }`}
                aria-hidden
              />
              {requisito.etiqueta}
            </li>
          ))}
        </ul>

        <p className="mt-4 flex gap-2 border-t border-pizarra-600/70 pt-3 text-[11px] leading-snug text-slate-600">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          El juego no premia tener la razón moral: premia dominar los tiempos parlamentarios sin
          quemar al colectivo en el intento.
        </p>
      </div>
    </section>
  );
}

function BarraAvanzar({
  estado,
  despachar,
  enJuego,
}: {
  estado: ReturnType<typeof useJuego>['estado'];
  despachar: ReturnType<typeof useJuego>['despachar'];
  enJuego: boolean;
}) {
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';

  return (
    <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="font-tactica text-[11px] text-slate-500">
        {enDescanso
          ? 'Estás inhabilitado. Solo el colectivo puede trabajar esta semana.'
          : 'Reparte tus horas, cabildea lo que alcance y cierra la semana.'}
      </p>
      <button
        type="button"
        className="boton boton-primario px-5 py-2 text-sm"
        disabled={!enJuego || estado.decisionPendiente !== null}
        onClick={() => despachar({ tipo: 'AVANZAR_SEMANA' })}
      >
        Avanzar a la semana {estado.semanaActual + 1}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
