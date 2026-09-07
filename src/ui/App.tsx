/**
 * CAPA DE PRESENTACIÓN — Tablero War Room.
 *
 * Este componente no contiene ni una sola regla de juego: lee `GameState`
 * y despacha comandos al Core Engine (principio de Lógica Pura Desacoplada,
 * GUIA sección 1 y Bitácora #010).
 *
 * Orden de aparición en la v2.0:
 *   Prólogo (Gael) → Wizard de onboarding → War Room
 *   y, durante la partida: hitos de desbloqueo, dilemas, gaceta y transiciones.
 */

import { ChevronRight, GraduationCap, Info, RotateCcw, Target, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

import {
  GLOSARIO,
  META_FIRMAS,
  SEMANAS_TOTALES,
  checklistVictoria,
  type ComandoJuego,
  type GameState,
} from '../engine';
import { alternarSilencio, estaSilenciado } from './audio/sello';
import { Bitacora } from './components/Bitacora';
import { Dashboard } from './components/Dashboard';
import { GacetaPopup } from './components/GacetaPopup';
import { HitoModal } from './components/HitoModal';
import { ModalDecision } from './components/ModalDecision';
import { NieblaMental } from './components/NieblaMental';
import { PanelColectivo } from './components/PanelColectivo';
import { PanelComisiones } from './components/PanelComisiones';
import { PanelHoras } from './components/PanelHoras';
import { PantallaDesenlace } from './components/PantallaDesenlace';
import { PrologoModal } from './components/PrologoModal';
import { ReporteSemana48 } from './components/ReporteSemana48';
import { Tooltip } from './components/Tooltip';
import { TransicionSemana } from './components/TransicionSemana';
import { VistaDual } from './components/VistaDual';
import { WizardOnboarding } from './components/WizardOnboarding';
import { useJuego } from './hooks/useJuego';

export function App() {
  const juego = useJuego();
  const {
    estado,
    despachar,
    reiniciar,
    avisos,
    enJuego,
    bloqueado,
    transicion,
    limpiarTransicion,
    prologoVisto,
    asumirMandato,
    tutorialVisto,
    terminarTutorial,
    repetirTutorial,
  } = juego;

  const mostrarReporte48 =
    estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48' &&
    estado.reporteSemana48?.semanaEmision === estado.semanaActual;

  // El prólogo va antes que todo; el wizard, en cuanto se asume el mandato.
  const mostrarPrologo = !prologoVisto;
  const mostrarWizard = prologoVisto && !tutorialVisto && enJuego;

  return (
    <div className="relative min-h-screen">
      <NieblaMental estado={estado} />

      <div
        className={`relative z-10 mx-auto max-w-[1500px] px-3 py-4 sm:px-5 ${
          estado.nieblaMentalActiva ? 'texto-desenfocado' : ''
        }`}
      >
        <BarraSuperior reiniciar={reiniciar} repetirTutorial={repetirTutorial} />

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

          <BarraAvanzar
            estado={estado}
            despachar={despachar}
            enJuego={enJuego}
            bloqueado={bloqueado}
          />
        </div>
      </div>

      {/* Capas superpuestas, de menos a más prioritaria */}
      {transicion && (
        <TransicionSemana
          key={transicion.semanaEntrante}
          resumen={transicion.resumen}
          semanaEntrante={transicion.semanaEntrante}
          totalSemanas={SEMANAS_TOTALES}
          relojCongeladora={transicion.relojCongeladora}
          onFinalizar={limpiarTransicion}
        />
      )}
      {estado.gacetaPendiente && !transicion && (
        <GacetaPopup
          gaceta={estado.gacetaPendiente}
          onCerrar={() => despachar({ tipo: 'CERRAR_GACETA' })}
        />
      )}
      {estado.hitoPendiente && (
        <HitoModal hito={estado.hitoPendiente} onCerrar={() => despachar({ tipo: 'CERRAR_HITO' })} />
      )}
      {estado.decisionPendiente && (
        <ModalDecision decision={estado.decisionPendiente} despachar={despachar} />
      )}
      {mostrarReporte48 && estado.reporteSemana48 && (
        <ReporteSemana48 reporte={estado.reporteSemana48} />
      )}
      {!enJuego && (
        <PantallaDesenlace
          estado={estado}
          reiniciar={() => {
            limpiarTransicion();
            reiniciar();
          }}
        />
      )}
      {mostrarWizard && <WizardOnboarding onTerminar={terminarTutorial} />}
      {mostrarPrologo && <PrologoModal onAsumir={asumirMandato} />}

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

function BarraSuperior({
  reiniciar,
  repetirTutorial,
}: {
  reiniciar: () => void;
  repetirTutorial: () => void;
}) {
  const [silenciado, setSilenciado] = useState(() => estaSilenciado());

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

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="boton"
          onClick={() => setSilenciado(alternarSilencio())}
          aria-pressed={silenciado}
          title={silenciado ? 'Activar sonido' : 'Silenciar'}
        >
          {silenciado ? (
            <VolumeX className="h-3 w-3" aria-hidden />
          ) : (
            <Volume2 className="h-3 w-3" aria-hidden />
          )}
          <span className="sr-only">{silenciado ? 'Activar sonido' : 'Silenciar'}</span>
        </button>

        <button type="button" className="boton" onClick={repetirTutorial}>
          <GraduationCap className="h-3 w-3" aria-hidden />
          Tutorial
        </button>

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
    </div>
  );
}

function PanelObjetivo({ estado }: { estado: GameState }) {
  const checklist = checklistVictoria(estado);
  const enEtapaA = !estado.comisionDesbloqueada;
  const progresoFirmas = Math.min(100, (estado.firmasRecolectadas / META_FIRMAS) * 100);

  return (
    <section className="panel">
      <h2 className="panel-titulo">
        <Target className="h-3.5 w-3.5" aria-hidden />
        {enEtapaA ? 'Meta de la etapa' : 'Condición de victoria'}
      </h2>
      <div className="p-4">
        {enEtapaA ? (
          <>
            <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-400">
              Junta <b className="text-papel-100">{META_FIRMAS} firmas ciudadanas</b> y blinda el
              articulado antes de presentar la iniciativa en Oficialía de Partes.
              <Tooltip titulo="Firmas ciudadanas" contenido={GLOSARIO.FIRMAS} />
            </p>

            <div className="mt-3">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="etiqueta">Firmas</span>
                <span className="font-tactica text-sm font-semibold tabular-nums text-papel-100">
                  {estado.firmasRecolectadas}
                  <span className="text-slate-500"> / {META_FIRMAS}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-pizarra-900">
                <div
                  className="h-full rounded-full bg-sky-500 transition-[width] duration-500"
                  style={{ width: `${progresoFirmas}%` }}
                />
              </div>
            </div>

            <p className="mt-4 flex gap-2 border-t border-pizarra-600/70 pt-3 text-[11px] leading-snug text-slate-600">
              <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              El Art. 71 fracción IV no te deja entrar al Congreso el día uno. Primero hay que
              demostrar respaldo. Aprovecha para aprender a repartir tus horas sin quemarte.
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}

function BarraAvanzar({
  estado,
  despachar,
  enJuego,
  bloqueado,
}: {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
  enJuego: boolean;
  bloqueado: boolean;
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
        data-tour="avanzar"
        className="boton boton-primario px-5 py-2 text-sm"
        disabled={!enJuego || bloqueado || estado.decisionPendiente !== null}
        onClick={() => despachar({ tipo: 'AVANZAR_SEMANA' })}
      >
        Avanzar a la semana {estado.semanaActual + 1}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
