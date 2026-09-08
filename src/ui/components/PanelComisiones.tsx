import {
  Banknote,
  CalendarClock,
  Handshake,
  MessagesSquare,
  Snowflake,
  Vote,
} from 'lucide-react';

import {
  BANCADAS,
  GLOSARIO,
  SEMANA_DESBLOQUEO_COMISION,
  TOOLTIP_BANCADA,
  esperaOrdenDelDia,
  estadoCongeladora,
  estadoReceso,
  estadoTramite,
  formatearPesos,
  semaforoComision,
  type ComandoJuego,
  type GameState,
  type Legislador,
  type Postura,
} from '../../engine';
import { PanelBloqueado } from './PanelBloqueado';
import { Tooltip } from './Tooltip';

const COLOR_BANCADA: Record<string, string> = {
  guinda: 'border-l-guinda',
  azulpan: 'border-l-azulpan',
  tricolor: 'border-l-tricolor',
  verdepvem: 'border-l-verdepvem',
};

const SEMAFORO: Record<Postura, { punto: string; texto: string; etiqueta: string }> = {
  FAVOR: { punto: 'bg-favor', texto: 'text-favor', etiqueta: 'A favor' },
  INDECISO: { punto: 'bg-indeciso', texto: 'text-indeciso', etiqueta: 'Indeciso' },
  OPOSITOR: { punto: 'bg-opositor', texto: 'text-opositor', etiqueta: 'En contra' },
};

interface Props {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}

export function PanelComisiones({ estado, despachar }: Props) {
  // Etapas A y B: la iniciativa aún no está turnada (GUIA v2.0 sección 5.B).
  if (!estado.comisionDesbloqueada) {
    return (
      <PanelBloqueado
        titulo="Comisión dictaminadora"
        icono={<Vote className="h-3.5 w-3.5" aria-hidden />}
        motivo="Iniciativa aún no turnada a comisiones"
        semanaApertura={SEMANA_DESBLOQUEO_COMISION}
        semanaActual={estado.semanaActual}
      />
    );
  }

  const comision = estado.comisionActiva;
  const votos = semaforoComision(estado);
  const reloj = estadoCongeladora(estado);

  const receso = estadoReceso(estado);

  if (!comision) {
    return (
      <section className="panel">
        <h2 className="panel-titulo">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          {receso.activo ? 'Receso parlamentario' : 'Comisión dictaminadora'}
        </h2>
        <div className="px-4 py-5">
          {receso.activo ? (
            <>
              <p className="text-center font-tactica text-2xl font-semibold tabular-nums text-olivo-400">
                {receso.semanasRestantes}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  {receso.semanasRestantes === 1 ? 'semana' : 'semanas'}
                </span>
              </p>
              <p className="mt-1 text-center text-[12px] leading-relaxed text-slate-400">
                El Congreso cerró su periodo ordinario. Abre de nuevo en la semana{' '}
                <b className="text-papel-100">{receso.semanaApertura}</b>.
              </p>
              <p className="mt-3 rounded border border-olivo-500/40 bg-olivo-600/10 px-3 py-2 text-[11px] leading-snug text-olivo-400">
                <b>El reloj de la congeladora no corre.</b> Es el único tramo de la partida en el
                que el tiempo no juega en tu contra.{' '}
                <Tooltip titulo="Receso parlamentario" contenido={GLOSARIO.RECESO} posicion="abajo" />
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-pizarra-600/70 pt-3 text-[11px] leading-snug text-slate-400">
                <li>
                  <b className="text-slate-300">Autocuidado</b> — la siguiente fase drena más
                  Resistencia por semana que esta.
                </li>
                <li>
                  <b className="text-slate-300">Movilizar</b> — el próximo foro de parlamento
                  abierto te va a pedir más Apoyo Social.
                </li>
                <li>
                  <b className="text-slate-300">Investigar</b> — el articulado que sirvió aquí no
                  alcanza para la instancia que sigue.
                </li>
                <li>
                  <b className="text-slate-300">Reclutar</b> — con fondos y apoyo, es el momento de
                  sumar perfiles al colectivo.
                </li>
              </ul>
            </>
          ) : (
            <p className="text-center text-sm leading-relaxed text-slate-500">
              No hay asunto turnado en este momento. El siguiente orden de gobierno abre su periodo
              de sesiones cuando lo marque el calendario legislativo.
            </p>
          )}
        </div>
      </section>
    );
  }

  const tramite = estadoTramite(estado);
  const ordenDelDia = esperaOrdenDelDia(estado);

  return (
    <section className="panel">
      <h2 className="panel-titulo">
        <Vote className="h-3.5 w-3.5" aria-hidden />
        {comision.nombre}
      </h2>

      {/*
       * Las etapas de trámite no se votan: se aguantan. El panel cambia de cara
       * para que el jugador no busque legisladores que no existen.
       */}
      {tramite.esTramite && tramite.requisito && (
        <div className="border-b border-pizarra-600/70 px-4 py-3">
          <p className="flex items-center gap-1.5 font-tactica text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden />
            {tramite.clase === 'PARLAMENTO_ABIERTO' ? 'Foro de consulta' : 'Opinión de Hacienda'}
            <Tooltip
              titulo={
                tramite.clase === 'PARLAMENTO_ABIERTO'
                  ? 'Parlamento abierto'
                  : 'Comisión de Presupuesto'
              }
              contenido={
                tramite.clase === 'PARLAMENTO_ABIERTO'
                  ? GLOSARIO.PARLAMENTO_ABIERTO
                  : GLOSARIO.COMISION_PRESUPUESTO
              }
              posicion="abajo"
            />
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
            {tramite.clase === 'PARLAMENTO_ABIERTO'
              ? 'Aquí no hay votos que juntar. La comisión convoca sesiones públicas y tú sostienes la sala llena mientras el reloj corre.'
              : 'Hacienda revisa el impacto presupuestario de la ley. No se negocia con nadie: se aguanta el calendario con el texto en regla.'}
          </p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="etiqueta">Sesiones</span>
            <span className="font-tactica text-sm font-semibold tabular-nums text-papel-100">
              {tramite.sesionesCumplidas}
              <span className="text-slate-500"> / {tramite.sesionesTotales}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-pizarra-900">
            <div
              className="h-full rounded-full bg-olivo-500 transition-[width] duration-500"
              style={{
                width: `${(tramite.sesionesCumplidas / Math.max(1, tramite.sesionesTotales)) * 100}%`,
              }}
            />
          </div>

          <p
            className={`mt-2.5 rounded border px-2.5 py-1.5 font-tactica text-[11px] leading-snug ${
              tramite.atorado
                ? 'border-opositor/40 bg-opositor/10 text-opositor'
                : 'border-favor/30 bg-favor/10 text-favor'
            }`}
          >
            {tramite.atorado
              ? `Trámite detenido: exige ${tramite.requisito.minimo}% de ${tramite.requisito.etiqueta} y llevas ${tramite.requisito.actual}%. Las sesiones no avanzan y el reloj sí.`
              : `${tramite.requisito.etiqueta} ${tramite.requisito.actual}% · el mínimo es ${tramite.requisito.minimo}%. Sostenlo hasta la última sesión.`}
          </p>
        </div>
      )}

      {ordenDelDia.activa && (
        <p className="border-b border-pizarra-600/70 bg-sky-950/40 px-4 py-2 font-tactica text-[11px] leading-snug text-sky-300">
          Dictamen enlistado en el orden del día · sesión {ordenDelDia.sesion} de{' '}
          {ordenDelDia.total}. Tener el dictamen no es tener la votación: la Mesa Directiva decide
          cuándo lo sube a tribuna.{' '}
          <Tooltip titulo="Orden del día" contenido={GLOSARIO.ORDEN_DEL_DIA} posicion="abajo" />
        </p>
      )}

      {/* Semáforo agregado y reloj de la congeladora */}
      {!tramite.esTramite && (
      <div className="grid grid-cols-2 gap-3 border-b border-pizarra-600/70 px-4 py-3 sm:grid-cols-4">
        <Marcador etiqueta="A favor" valor={votos.FAVOR} clase="text-favor" />
        <Marcador etiqueta="Indecisos" valor={votos.INDECISO} clase="text-indeciso" />
        <Marcador etiqueta="En contra" valor={votos.OPOSITOR} clase="text-opositor" />
        <Marcador
          etiqueta="Se requieren"
          valor={votos.requeridos}
          clase={votos.suficientes ? 'text-favor' : 'text-slate-300'}
        />
      </div>
      )}

      {reloj.activa && (
        <div className="border-b border-pizarra-600/70 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`flex items-center gap-1.5 font-tactica text-[11px] uppercase tracking-[0.12em] ${
                reloj.critico ? 'text-opositor' : 'text-slate-400'
              }`}
            >
              <Snowflake className="h-3.5 w-3.5" aria-hidden />
              Reloj de la congeladora
              <Tooltip titulo="Congeladora" contenido={GLOSARIO.CONGELADORA} posicion="abajo" />
            </span>
            <span
              className={`font-tactica text-sm font-semibold tabular-nums ${
                reloj.critico ? 'text-opositor' : 'text-slate-200'
              }`}
            >
              {reloj.semanasRestantes} sem.
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-pizarra-900">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                reloj.critico ? 'bg-opositor animate-pulso-rojo' : 'bg-sky-600'
              }`}
              style={{ width: `${reloj.porcentaje}%` }}
            />
          </div>
        </div>
      )}

      {comision.dictamenAprobado && !tramite.esTramite && (
        <p className="border-b border-pizarra-600/70 bg-favor/10 px-4 py-2 font-tactica text-[11px] text-favor">
          Dictamen aprobado. Falta que el Pleno lo agende: necesitas{' '}
          {comision.presionPlenoRequerida}% de Presión Política.
        </p>
      )}

      {!tramite.esTramite && estado.solidezTecnica < comision.solidezTecnicaRequerida && (
        <p className="border-b border-pizarra-600/70 bg-alerta/10 px-4 py-2 font-tactica text-[11px] text-alerta">
          Solidez Técnica insuficiente: esta comisión exige {comision.solidezTecnicaRequerida}% y
          llevas {Math.round(estado.solidezTecnica)}%. Con los votos pero sin el texto, te devuelven
          el dictamen.
        </p>
      )}

      <ul className="divide-y divide-pizarra-700/70">
        {comision.legisladores.map((legislador) => (
          <FichaLegislador
            key={legislador.id}
            legislador={legislador}
            estado={estado}
            despachar={despachar}
          />
        ))}
      </ul>
    </section>
  );
}

function Marcador({ etiqueta, valor, clase }: { etiqueta: string; valor: number; clase: string }) {
  return (
    <div>
      <p className="etiqueta">{etiqueta}</p>
      <p className={`font-tactica text-xl font-semibold tabular-nums ${clase}`}>{valor}</p>
    </div>
  );
}

function FichaLegislador({
  legislador,
  estado,
  despachar,
}: {
  legislador: Legislador;
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}) {
  const bancada = BANCADAS[legislador.partido];
  const semaforo = SEMAFORO[legislador.postura];
  const yaVota = legislador.postura === 'FAVOR';
  const alcanzaPresion = estado.recursos.presionPolitica >= legislador.costoCabildeo;
  const puedeComprar =
    legislador.precioVotoFondos !== undefined &&
    estado.recursos.fondos >= legislador.precioVotoFondos;

  return (
    <li
      className={`border-l-4 px-4 py-2.5 ${COLOR_BANCADA[bancada.color]} ${
        yaVota ? 'bg-favor/5' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${semaforo.punto}`}
          title={semaforo.etiqueta}
          aria-label={semaforo.etiqueta}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-tactica text-xs font-semibold text-slate-200">
            {legislador.nombre}
            {legislador.esCoordinador && (
              <span className="ml-1.5 rounded bg-pizarra-600 px-1 py-0.5 text-[9px] uppercase tracking-wide text-slate-400">
                Coordina
              </span>
            )}
          </p>
          <Tooltip
            titulo={bancada.nombre}
            contenido={TOOLTIP_BANCADA[legislador.partido] ?? bancada.maña}
            className="max-w-full"
          >
            <span className="truncate text-[10px] text-slate-500 underline decoration-dotted underline-offset-2">
              {bancada.nombre}
            </span>
          </Tooltip>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!yaVota && (
            <button
              type="button"
              className="boton boton-tactil px-2 py-1"
              disabled={!alcanzaPresion}
              onClick={() => despachar({ tipo: 'CABILDEAR_LEGISLADOR', legisladorId: legislador.id })}
              title={`Cabildear: cuesta ${legislador.costoCabildeo} de Presión Política`}
            >
              <Handshake className="h-3 w-3" aria-hidden />
              {legislador.costoCabildeo}
            </button>
          )}
          {!yaVota && legislador.precioVotoFondos !== undefined && (
            <button
              type="button"
              className="boton boton-tactil px-2 py-1 text-verdepvem"
              disabled={!puedeComprar}
              onClick={() => despachar({ tipo: 'COMPRAR_VOTO', legisladorId: legislador.id })}
              title={`Comprar el voto por ${formatearPesos(legislador.precioVotoFondos)}. Las bases se enteran.`}
            >
              <Banknote className="h-3 w-3" aria-hidden />
            </button>
          )}
          {yaVota && (
            <span className={`font-tactica text-[10px] uppercase ${semaforo.texto}`}>
              {semaforo.etiqueta}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
