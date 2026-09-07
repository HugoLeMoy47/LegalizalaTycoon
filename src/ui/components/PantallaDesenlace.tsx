/**
 * Pantallas finales: promulgación en el DOF, congeladora y colapso.
 */

import { RotateCcw } from 'lucide-react';

import { SEMANAS_TOTALES, type EstadoJuego, type GameState } from '../../engine';

interface Props {
  estado: GameState;
  reiniciar: () => void;
}

export function PantallaDesenlace({ estado, reiniciar }: Props) {
  const desenlace = estado.estadoJuego;
  const mutilada = estado.iniciativaMutilada;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-pizarra-900/95 p-4">
      <div className="w-full max-w-3xl py-8">
        {desenlace === 'VICTORIA_DOF' ? (
          <DiarioOficial estado={estado} />
        ) : (
          <ActaDeDerrota desenlace={desenlace} estado={estado} />
        )}

        <div className="mt-6 rounded-lg border border-pizarra-600 bg-pizarra-800/70 p-4">
          <h3 className="etiqueta">Balance de la partida</h3>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Dato etiqueta="Semanas" valor={`${estado.semanaActual} / ${SEMANAS_TOTALES}`} />
            <Dato etiqueta="Apoyo social" valor={`${Math.round(estado.recursos.apoyoSocial)}%`} />
            <Dato etiqueta="Resistencia" valor={`${Math.round(estado.recursos.resistencia)}%`} />
            <Dato
              etiqueta="Colectivo"
              valor={`${estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length} aliados`}
            />
          </dl>

          {mutilada && desenlace === 'VICTORIA_DOF' && (
            <p className="mt-4 border-l-2 border-alerta pl-3 text-[13px] leading-relaxed text-alerta">
              Ganaste la foto, no la reforma. Sin autocultivo y sin presupuesto etiquetado, la ley
              existe en el papel pero no cambia lo que pasa en la calle. Las detenciones siguieron
              igual el año siguiente.
            </p>
          )}

          <button type="button" className="boton boton-primario mt-5 w-full" onClick={reiniciar}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Empezar una nueva iniciativa
          </button>
        </div>
      </div>
    </div>
  );
}

function DiarioOficial({ estado }: { estado: GameState }) {
  return (
    <article className="carpeta px-8 py-8 text-center">
      <p className="font-oficial text-[11px] uppercase tracking-[0.28em] text-pizarra-900/60">
        Diario Oficial de la Federación
      </p>
      <div className="mx-auto my-3 h-px w-32 bg-pizarra-900/30" />
      <h2 className="font-oficial text-2xl leading-tight text-pizarra-900">
        DECRETO por el que se reforman diversas disposiciones de la Ley General de Salud y del
        Código Penal Federal en materia de Regulación Integral del Cannabis
      </h2>
      <p className="mt-4 font-oficial text-[13px] leading-relaxed text-pizarra-900/80">
        Publicado en la semana {estado.semanaActual} de la legislatura. Entrará en vigor al día
        siguiente de su publicación.
      </p>

      <span
        className="sello sello-tinta-verde animate-sello mt-6 inline-flex text-[15px]"
        style={{ transform: 'rotate(-6deg)' }}
      >
        {estado.iniciativaMutilada ? 'Publicado con enmiendas' : 'Publicado íntegro'}
      </span>

      <p className="mt-6 font-oficial text-[12px] italic leading-relaxed text-pizarra-900/70">
        {estado.iniciativaMutilada
          ? '“La iniciativa ciudadana llegó al Diario Oficial. Llegó sin dientes, pero llegó.”'
          : '“Dos años, cien semanas, tres órdenes de gobierno y un colectivo que no se rompió.”'}
      </p>
    </article>
  );
}

const ACTAS: Record<
  Exclude<EstadoJuego, 'VICTORIA_DOF' | 'JUGANDO' | 'DESCANSO_FORZADO_SEM_48'>,
  { titulo: string; cuerpo: string; leccion: string }
> = {
  DERROTA_CONGELADORA: {
    titulo: 'Asunto total y definitivamente concluido',
    cuerpo:
      'Expiró el plazo reglamentario sin que la comisión emitiera dictamen. El expediente se archiva. No hubo votación, no hubo debate, no hubo nadie a quien reclamarle: la congeladora no es una decisión, es un calendario.',
    leccion:
      'La técnica parlamentaria y los tiempos de gaceta no son burocracia decorativa: son el terreno donde se gana o se pierde.',
  },
  DERROTA_BURNOUT: {
    titulo: 'Colapso del coordinador',
    cuerpo:
      'La Resistencia llegó a cero. No hubo una última reunión heroica: hubo un cuerpo que dejó de responder y un colectivo sin quien lo articulara. La iniciativa quedó viva en el papel y muerta en la práctica.',
    leccion:
      'El activista mártir no es un modelo: es un punto de falla. Delegar y descansar eran movimientos estratégicos, no lujos.',
  },
};

function ActaDeDerrota({
  desenlace,
  estado,
}: {
  desenlace: EstadoJuego;
  estado: GameState;
}) {
  const acta = ACTAS[desenlace as keyof typeof ACTAS];
  if (!acta) return null;

  return (
    <article className="panel border-opositor/40 p-8">
      <p className="etiqueta text-opositor">Fin de la partida · Semana {estado.semanaActual}</p>
      <h2 className="mt-2 font-tactica text-2xl font-semibold leading-tight text-papel-100">
        {acta.titulo}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{acta.cuerpo}</p>
      <p className="mt-5 border-l-2 border-olivo-500 pl-3 text-[13px] italic leading-relaxed text-olivo-400">
        {acta.leccion}
      </p>
    </article>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="etiqueta">{etiqueta}</dt>
      <dd className="font-tactica text-sm font-semibold text-papel-100">{valor}</dd>
    </div>
  );
}
