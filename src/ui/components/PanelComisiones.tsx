import { Banknote, Handshake, Snowflake, Vote } from 'lucide-react';

import {
  BANCADAS,
  GLOSARIO,
  SEMANA_DESBLOQUEO_COMISION,
  TOOLTIP_BANCADA,
  estadoCongeladora,
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

  if (!comision) {
    return (
      <section className="panel">
        <h2 className="panel-titulo">
          <Vote className="h-3.5 w-3.5" aria-hidden />
          Comisión dictaminadora
        </h2>
        <p className="px-4 py-6 text-center text-sm leading-relaxed text-slate-500">
          No hay asunto turnado en este momento. El siguiente orden de gobierno abre su periodo de
          sesiones cuando lo marque el calendario legislativo.
          <br />
          <span className="mt-2 block font-tactica text-[11px] text-slate-600">
            Aprovecha el receso: recluta, levanta fondos, blinda el texto y recupera resistencia.
          </span>
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2 className="panel-titulo">
        <Vote className="h-3.5 w-3.5" aria-hidden />
        {comision.nombre}
      </h2>

      {/* Semáforo agregado y reloj de la congeladora */}
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

      {comision.dictamenAprobado && (
        <p className="border-b border-pizarra-600/70 bg-favor/10 px-4 py-2 font-tactica text-[11px] text-favor">
          Dictamen aprobado. Falta que el Pleno lo agende: necesitas{' '}
          {comision.presionPlenoRequerida}% de Presión Política.
        </p>
      )}

      {estado.solidezTecnica < comision.solidezTecnicaRequerida && (
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
