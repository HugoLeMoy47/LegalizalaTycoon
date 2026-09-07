import { AlarmClockPlus, ChevronRight, Flame, Minus, Plus, Timer } from 'lucide-react';

import {
  BLOQUE_HORAS_EXTRA,
  COSTO_RESISTENCIA_POR_BLOQUE,
  DESCRIPCION_VERBO,
  ETIQUETA_VERBO,
  MAX_BLOQUES_HORAS_EXTRA,
  VERBOS,
  calcularRendimiento,
  estimacionMostrada,
  horasDisponibles,
  multiplicadorFatiga,
  verboDisponible,
  type ComandoJuego,
  type GameState,
  type VerboAccion,
} from '../../engine';

interface Props {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}

const PASO_HORAS = 5;

export function PanelHoras({ estado, despachar }: Props) {
  const disponibles = horasDisponibles(estado);
  const bloquesExtra = estado.recursos.horasExtraMetidas / BLOQUE_HORAS_EXTRA;
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';
  const proyeccion = calcularRendimiento(estado);
  const niebla = estado.nieblaMentalActiva;
  const fatigaSiguiente = multiplicadorFatiga(estado.semanasConsecutivasHorasExtra + 1);

  const ajustar = (verbo: VerboAccion, delta: number) =>
    despachar({
      tipo: 'ASIGNAR_HORAS',
      verbo,
      horas: Math.max(0, estado.asignaciones[verbo] + delta),
    });

  const proyectado: Record<VerboAccion, string> = {
    INVESTIGAR: `+${estimacionMostrada(proyeccion.solidezTecnica, niebla).toFixed(1)} solidez`,
    MOVILIZAR: `+${estimacionMostrada(proyeccion.apoyoSocial, niebla).toFixed(1)} apoyo`,
    CABILDEAR: `+${estimacionMostrada(proyeccion.presionPolitica, niebla).toFixed(1)} presión / −${proyeccion.costoApoyoCabildeo.toFixed(1)} apoyo`,
    AUTOCUIDADO: `+${estimacionMostrada(proyeccion.resistencia, niebla).toFixed(1)} resistencia`,
  };

  return (
    <section className="panel" data-tour="horas">
      <h2 className="panel-titulo">
        <Timer className="h-3.5 w-3.5" aria-hidden />
        Presupuesto de horas
        <span className="ml-auto font-tactica text-xs normal-case tracking-normal text-slate-300">
          <span
            className={`text-base font-semibold tabular-nums ${
              disponibles > 0 ? 'text-papel-100' : 'text-slate-500'
            }`}
          >
            {disponibles}
          </span>
          <span className="text-slate-500"> hrs libres</span>
        </span>
      </h2>

      <div className="divide-y divide-pizarra-700/70">
        {VERBOS.map((verbo) => {
          const horas = estado.asignaciones[verbo];
          const bloqueado = !verboDisponible(estado, verbo);
          return (
            <div key={verbo} className={`px-4 py-2.5 ${bloqueado ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-tactica text-xs font-semibold text-slate-200">
                    {ETIQUETA_VERBO[verbo]}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {bloqueado
                      ? 'Todavía no hay expediente en el Congreso: no hay a quién cabildear.'
                      : DESCRIPCION_VERBO[verbo]}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="boton boton-tactil px-2 py-1"
                    onClick={() => ajustar(verbo, -PASO_HORAS)}
                    disabled={bloqueado || enDescanso || horas <= 0}
                    aria-label={`Quitar horas a ${ETIQUETA_VERBO[verbo]}`}
                  >
                    <Minus className="h-3 w-3" aria-hidden />
                  </button>
                  <span className="w-12 text-center font-tactica text-sm font-semibold tabular-nums text-papel-100">
                    {horas}h
                  </span>
                  <button
                    type="button"
                    className="boton boton-tactil px-2 py-1"
                    onClick={() => ajustar(verbo, PASO_HORAS)}
                    disabled={bloqueado || enDescanso || disponibles < PASO_HORAS}
                    aria-label={`Añadir horas a ${ETIQUETA_VERBO[verbo]}`}
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              </div>

              {horas > 0 && (
                <p className="mt-1.5 flex items-center gap-1 font-tactica text-[10px] text-olivo-400">
                  <ChevronRight className="h-3 w-3" aria-hidden />
                  Proyección: {proyectado[verbo]}
                  {niebla && <span className="text-opositor/80"> (lectura poco confiable)</span>}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón rojo de la autoexplotación (GDD 8) */}
      <div className="border-t border-pizarra-600/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-tactica text-xs font-semibold text-opositor">
              <Flame className="h-3.5 w-3.5" aria-hidden />
              Meter horas extra
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              +{BLOQUE_HORAS_EXTRA} hrs por bloque, −{COSTO_RESISTENCIA_POR_BLOQUE}% de Resistencia
              inmediato.
              {estado.semanasConsecutivasHorasExtra >= 2 && (
                <span className="text-alerta">
                  {' '}
                  Llevas {estado.semanasConsecutivasHorasExtra} semanas seguidas: el próximo bloque
                  cuesta ×{fatigaSiguiente.toFixed(2)}.
                </span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="boton boton-tactil px-2 py-1"
              onClick={() => despachar({ tipo: 'QUITAR_HORAS_EXTRA' })}
              disabled={bloquesExtra <= 0}
              aria-label="Quitar un bloque de horas extra"
            >
              <Minus className="h-3 w-3" aria-hidden />
            </button>
            <span className="w-12 text-center font-tactica text-sm font-semibold tabular-nums text-opositor">
              +{estado.recursos.horasExtraMetidas}h
            </span>
            <button
              type="button"
              className={`boton boton-peligro boton-tactil px-2 py-1 ${
                bloquesExtra < MAX_BLOQUES_HORAS_EXTRA && !enDescanso ? 'animate-pulso-rojo' : ''
              }`}
              onClick={() => despachar({ tipo: 'METER_HORAS_EXTRA' })}
              disabled={enDescanso || bloquesExtra >= MAX_BLOQUES_HORAS_EXTRA}
              aria-label="Meter un bloque de horas extra"
            >
              <AlarmClockPlus className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
