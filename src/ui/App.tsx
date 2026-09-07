/**
 * CAPA DE PRESENTACIÓN — Tablero War Room.
 *
 * Este componente no contiene ni una sola regla de juego: lee `GameState`
 * y despacha comandos al Core Engine (principio de Lógica Pura Desacoplada,
 * GUIA sección 1 y Bitácora #010).
 *
 * Dos composiciones sobre los mismos componentes:
 *
 * · Escritorio (≥1280 px): página con scroll y tres columnas.
 * · Móvil: app shell de altura fija — cabecera y barra de acción siempre
 *   visibles, y solo el contenido central se desplaza. La auditoría en 375 px
 *   medía 3 593 px de scroll por turno con el botón de avanzar semana hasta
 *   el fondo; el juego se diseñó para jugarse principalmente en el teléfono.
 */

import { useCallback, useState } from 'react';
import {
  ChevronRight,
  FastForward,
  GraduationCap,
  Info,
  RotateCcw,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';

import {
  GLOSARIO,
  META_FIRMAS,
  SEMANAS_TOTALES,
  checklistVictoria,
  eventosSinLeer,
  pasosDelTurno,
  type ComandoJuego,
  type GameState,
} from '../engine';
import { alternarSilencio, estaSilenciado } from './audio/sello';
import { Bitacora } from './components/Bitacora';
import { Dashboard, DashboardCompacto } from './components/Dashboard';
import { GacetaPopup } from './components/GacetaPopup';
import { GuiaTurno } from './components/GuiaTurno';
import { HitoModal } from './components/HitoModal';
import { ModalDecision } from './components/ModalDecision';
import { NieblaMental } from './components/NieblaMental';
import { PanelColectivo } from './components/PanelColectivo';
import { PanelComisiones } from './components/PanelComisiones';
import { PanelHoras } from './components/PanelHoras';
import { PantallaDesenlace } from './components/PantallaDesenlace';
import { PestanasMovil, type PestanaMovil } from './components/PestanasMovil';
import { PrologoModal } from './components/PrologoModal';
import { ReporteSemana48 } from './components/ReporteSemana48';
import { Tooltip } from './components/Tooltip';
import { TransicionSemana } from './components/TransicionSemana';
import { VistaDual } from './components/VistaDual';
import { WizardOnboarding } from './components/WizardOnboarding';
import { useEsMovil } from './hooks/useEsMovil';
import { useJuego } from './hooks/useJuego';

/** En móvil cada objetivo del tutorial vive en una pestaña distinta. */
const PESTANA_DEL_TUTORIAL: Record<string, PestanaMovil | null> = {
  triada: null, // vive en la cabecera fija
  horas: 'OPERACION',
  'vista-dual': 'EXPEDIENTE',
  pestanas: null, // la barra de pestañas siempre está a la vista
  'guia-turno': null, // vive en la barra de acción fija
  avanzar: null, // vive en la barra de acción fija
};

export function App() {
  const juego = useJuego();
  const esMovil = useEsMovil();
  const [pestana, setPestana] = useState<PestanaMovil>('OPERACION');

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

  const mostrarPrologo = !prologoVisto;
  const mostrarWizard = prologoVisto && !tutorialVisto && enJuego;

  // El tutorial cambia de pestaña por el jugador para que el objetivo exista.
  const alCambiarPasoTutorial = useCallback(
    (objetivo: string) => {
      const destino = PESTANA_DEL_TUTORIAL[objetivo];
      if (destino) setPestana(destino);
    },
    [],
  );

  const sinLeer = eventosSinLeer(estado);
  const pasos = pasosDelTurno(estado);
  const pendientes: PestanaMovil[] = [];
  if (pasos[0].disponible && !pasos[0].hecho) pendientes.push('OPERACION');
  if (pasos[1].disponible && !pasos[1].hecho) pendientes.push('COMISION');

  const capas = (
    <>
      {transicion && (
        <TransicionSemana
          key={transicion.semanaEntrante}
          resumen={transicion.resumen}
          semanaEntrante={transicion.semanaEntrante}
          totalSemanas={SEMANAS_TOTALES}
          relojCongeladora={transicion.relojCongeladora}
          avance={transicion.avance}
          sucesos={transicion.sucesos}
          onFinalizar={limpiarTransicion}
        />
      )}
      {estado.gacetaPendiente && !transicion && (
        <GacetaPopup
          gaceta={estado.gacetaPendiente}
          onCerrar={() => despachar({ tipo: 'CERRAR_GACETA' })}
        />
      )}
      {estado.hitoPendiente && !transicion && (
        <HitoModal hito={estado.hitoPendiente} onCerrar={() => despachar({ tipo: 'CERRAR_HITO' })} />
      )}
      {estado.decisionPendiente && !transicion && (
        <ModalDecision decision={estado.decisionPendiente} despachar={despachar} />
      )}
      {mostrarReporte48 && !transicion && estado.reporteSemana48 && (
        <ReporteSemana48 reporte={estado.reporteSemana48} />
      )}
      {!enJuego && !transicion && (
        <PantallaDesenlace
          estado={estado}
          reiniciar={() => {
            limpiarTransicion();
            reiniciar();
          }}
        />
      )}
      {mostrarWizard && (
        <WizardOnboarding
          onTerminar={terminarTutorial}
          onObjetivo={alCambiarPasoTutorial}
          esMovil={esMovil}
        />
      )}
      {mostrarPrologo && <PrologoModal onAsumir={asumirMandato} />}

      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[76] w-full max-w-md -translate-x-1/2 space-y-2 px-4 xl:bottom-4">
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
    </>
  );

  if (esMovil) {
    return (
      <div className="relative">
        <NieblaMental estado={estado} />

        <div
          className={`flex h-dvh flex-col ${estado.nieblaMentalActiva ? 'texto-desenfocado' : ''}`}
        >
          <div className="relative z-20 shrink-0">
            <BarraSuperior compacta reiniciar={reiniciar} repetirTutorial={repetirTutorial} />
            <DashboardCompacto estado={estado} />
            <PestanasMovil
              activa={pestana}
              onCambiar={setPestana}
              conPendiente={pendientes}
              bloqueadas={estado.comisionDesbloqueada ? [] : ['COMISION']}
              novedades={{ BITACORA: sinLeer.length }}
            />
          </div>

          <main className="relative z-10 min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {pestana === 'OPERACION' && (
              <>
                <PanelHoras estado={estado} despachar={despachar} />
                <PanelColectivo estado={estado} despachar={despachar} />
              </>
            )}
            {pestana === 'COMISION' && <PanelComisiones estado={estado} despachar={despachar} />}
            {pestana === 'EXPEDIENTE' && <VistaDual estado={estado} />}
            {pestana === 'BITACORA' && (
              <>
                <PanelObjetivo estado={estado} />
                <Bitacora estado={estado} despachar={despachar} marcarLeidasAlVer />
              </>
            )}
          </main>

          <div className="relative z-20 shrink-0 border-t border-pizarra-600/70 bg-pizarra-800/95 px-3 py-2">
            <GuiaTurno estado={estado} compacta />
            <BarraAvanzar
              estado={estado}
              despachar={despachar}
              enJuego={enJuego}
              bloqueado={bloqueado}
              compacta
            />
          </div>
        </div>

        {capas}
      </div>
    );
  }

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
          <GuiaTurno estado={estado} />
          <VistaDual estado={estado} />

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <PanelHoras estado={estado} despachar={despachar} />
              <PanelColectivo estado={estado} despachar={despachar} />
            </div>

            <PanelComisiones estado={estado} despachar={despachar} />

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

      {capas}
    </div>
  );
}

function BarraSuperior({
  reiniciar,
  repetirTutorial,
  compacta = false,
}: {
  reiniciar: () => void;
  repetirTutorial: () => void;
  compacta?: boolean;
}) {
  const [silenciado, setSilenciado] = useState(() => estaSilenciado());

  const acciones = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="boton boton-tactil"
        onClick={() => setSilenciado(alternarSilencio())}
        aria-pressed={silenciado}
        title={silenciado ? 'Activar sonido' : 'Silenciar'}
      >
        {silenciado ? (
          <VolumeX className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
        <span className="sr-only">{silenciado ? 'Activar sonido' : 'Silenciar'}</span>
      </button>

      <button
        type="button"
        className="boton boton-tactil"
        onClick={repetirTutorial}
        title="Ver el tutorial otra vez"
      >
        <GraduationCap className="h-4 w-4" aria-hidden />
        <span className={compacta ? 'sr-only' : ''}>Tutorial</span>
      </button>

      <button
        type="button"
        className="boton boton-tactil"
        onClick={() => {
          if (confirm('¿Reiniciar la partida? Se perderá el avance guardado.')) reiniciar();
        }}
        title="Reiniciar la partida"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        <span className={compacta ? 'sr-only' : ''}>Reiniciar</span>
      </button>
    </div>
  );

  if (compacta) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-pizarra-600/70 bg-pizarra-900 px-3 py-1.5">
        <h1 className="truncate font-tactica text-[11px] font-semibold uppercase tracking-[0.16em] text-papel-100">
          Mandato de Ley
        </h1>
        {acciones}
      </div>
    );
  }

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
      {acciones}
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
  compacta = false,
}: {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
  enJuego: boolean;
  bloqueado: boolean;
  compacta?: boolean;
}) {
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';

  const inhabilitado = !enJuego || bloqueado || estado.decisionPendiente !== null;

  /*
   * La acción principal corre varias semanas y se detiene sola cuando algo
   * requiere al jugador. El avance de una sola semana queda como control fino
   * para los momentos de tensión, donde cada turno cuenta.
   */
  const botones = (
    <div className="flex items-stretch gap-2" data-tour="avanzar">
      <button
        type="button"
        className={`boton boton-primario boton-tactil flex-1 ${
          compacta ? 'py-2.5 text-sm' : 'px-5 py-2 text-sm'
        }`}
        disabled={inhabilitado}
        onClick={() => despachar({ tipo: 'AVANZAR_HASTA_EVENTO' })}
        title="Corre las semanas hasta que ocurra algo que necesite tu atención"
      >
        <FastForward className="h-4 w-4" aria-hidden />
        Avanzar hasta el próximo suceso
      </button>

      <button
        type="button"
        className="boton boton-tactil shrink-0 px-3"
        disabled={inhabilitado}
        onClick={() => despachar({ tipo: 'AVANZAR_SEMANA' })}
        title={`Avanzar solo a la semana ${estado.semanaActual + 1}`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="sr-only">Avanzar una sola semana</span>
        <span aria-hidden className="font-tactica text-[11px]">
          +1
        </span>
      </button>
    </div>
  );

  if (compacta) return <div className="mt-2">{botones}</div>;

  return (
    <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="font-tactica text-[11px] text-slate-500">
        {enDescanso
          ? 'Estás inhabilitado. Solo el colectivo puede trabajar esta semana.'
          : 'Tus horas siguen aplicándose semana a semana hasta que las cambies.'}
      </p>
      {botones}
    </div>
  );
}
