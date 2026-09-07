import {
  BrainCircuit,
  CalendarDays,
  Coins,
  Landmark,
  Megaphone,
  ScrollText,
  Users,
} from 'lucide-react';

import {
  SEMANAS_TOTALES,
  UMBRAL_ALERTA_REGIMEN,
  UMBRAL_NIEBLA_MENTAL,
  VICTORIA,
  formatearPesos,
  type GameState,
} from '../../engine';
import { BarraRecurso } from './BarraRecurso';

const NOMBRE_FASE: Record<GameState['faseActual'], string> = {
  MUNICIPAL: 'Municipal · Cabildo',
  ESTATAL: 'Estatal · Congreso local',
  FEDERAL: 'Federal · Congreso de la Unión',
};

const RANGO_FASE: Record<GameState['faseActual'], string> = {
  MUNICIPAL: 'Semanas 1-30',
  ESTATAL: 'Semanas 31-65',
  FEDERAL: 'Semanas 66-100',
};

/**
 * Cabecera compacta para móvil: se queda fija arriba para que el jugador nunca
 * pierda de vista la semana ni la tríada mientras reparte horas o cabildea.
 * Ocupa ~64 px frente a los 217 px de la versión completa.
 */
export function DashboardCompacto({ estado }: { estado: GameState }) {
  const { recursos } = estado;

  return (
    <header className="panel rounded-none border-x-0 border-t-0 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-tactica text-sm font-semibold tabular-nums text-papel-100">
          S{estado.semanaActual}
          <span className="text-slate-500">/{SEMANAS_TOTALES}</span>
        </p>
        <p className="truncate font-tactica text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {NOMBRE_FASE[estado.faseActual]}
        </p>
        <p className="shrink-0 font-tactica text-[10px] tabular-nums text-slate-400">
          {estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length}/3 aliados
        </p>
      </div>

      <div className="mt-1.5 flex items-center gap-2" data-tour="triada">
        <MiniBarra etiqueta="Apoyo" valor={recursos.apoyoSocial} clase="bg-sky-500" />
        <MiniBarra etiqueta="Presión" valor={recursos.presionPolitica} clase="bg-alerta" />
        <MiniBarra
          etiqueta="Resist."
          valor={recursos.resistencia}
          clase={
            recursos.resistencia < UMBRAL_NIEBLA_MENTAL
              ? 'bg-opositor animate-pulso-rojo'
              : 'bg-favor'
          }
        />
      </div>

      {enDescansoForzado(estado) && (
        <p className="franja-diagonal mt-1.5 rounded px-2 py-0.5 text-center font-tactica text-[9px] uppercase tracking-[0.12em] text-alerta">
          Descanso forzado
        </p>
      )}
    </header>
  );
}

function MiniBarra({ etiqueta, valor, clase }: { etiqueta: string; valor: number; clase: string }) {
  const acotado = Math.max(0, Math.min(100, valor));
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between">
        <span className="truncate font-tactica text-[9px] uppercase tracking-wide text-slate-500">
          {etiqueta}
        </span>
        <span className="font-tactica text-[10px] font-semibold tabular-nums text-slate-200">
          {Math.round(acotado)}%
        </span>
      </div>
      <div
        className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-pizarra-900"
        role="meter"
        aria-label={etiqueta}
        aria-valuenow={Math.round(acotado)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${clase}`}
          style={{ width: `${acotado}%` }}
        />
      </div>
    </div>
  );
}

function enDescansoForzado(estado: GameState): boolean {
  return estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';
}

export function Dashboard({ estado }: { estado: GameState }) {
  const { recursos, ultimoTurno } = estado;
  const enDescanso = estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48';

  return (
    <header className="panel px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="etiqueta flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" aria-hidden /> Semana
            </p>
            <p className="font-tactica text-2xl font-semibold tabular-nums leading-tight text-papel-100">
              {estado.semanaActual}
              <span className="text-base text-slate-500"> / {SEMANAS_TOTALES}</span>
            </p>
          </div>

          <div className="h-10 w-px bg-pizarra-600" />

          <div>
            <p className="etiqueta flex items-center gap-1.5">
              <Landmark className="h-3 w-3" aria-hidden /> Fase
            </p>
            <p className="font-tactica text-sm font-semibold leading-tight text-papel-100">
              {NOMBRE_FASE[estado.faseActual]}
            </p>
            <p className="font-tactica text-[10px] text-slate-500">{RANGO_FASE[estado.faseActual]}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="etiqueta flex items-center justify-end gap-1.5">
              <Coins className="h-3 w-3" aria-hidden /> Fondos
            </p>
            <p className="font-tactica text-sm font-semibold tabular-nums text-papel-200">
              {formatearPesos(recursos.fondos)}
            </p>
          </div>

          <div className="h-10 w-px bg-pizarra-600" />

          <div className="text-right">
            <p className="etiqueta flex items-center justify-end gap-1.5">
              <Users className="h-3 w-3" aria-hidden /> Colectivo
            </p>
            <p className="font-tactica text-sm font-semibold tabular-nums text-papel-200">
              {estado.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length} / 3 aliados
            </p>
          </div>
        </div>
      </div>

      {enDescanso && (
        <p className="franja-diagonal mt-3 rounded border border-alerta/40 px-3 py-1.5 font-tactica text-[11px] uppercase tracking-[0.14em] text-alerta">
          Descanso forzado obligatorio · el líder está inhabilitado esta semana
        </p>
      )}

      <div data-tour="triada-escritorio" className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
        <BarraRecurso
          etiqueta="Apoyo social"
          valor={recursos.apoyoSocial}
          delta={ultimoTurno?.deltaApoyoSocial}
          icono={Megaphone}
          tono="apoyo"
          umbral={{ valor: VICTORIA.apoyoSocialMinimo, etiqueta: 'Mínimo para promulgar' }}
          ayuda="Legitimidad popular en calles y comunidades. Alimenta el cabildeo y las donaciones."
        />
        <BarraRecurso
          etiqueta="Presión política"
          valor={recursos.presionPolitica}
          delta={ultimoTurno?.deltaPresionPolitica}
          icono={Landmark}
          tono="presion"
          umbral={{ valor: UMBRAL_ALERTA_REGIMEN, etiqueta: 'Alerta del régimen' }}
          ayuda="Capacidad de mover votos y agendar dictámenes. Arriba de 80% despiertas al aparato."
        />
        <BarraRecurso
          etiqueta="Resistencia"
          valor={recursos.resistencia}
          delta={ultimoTurno?.deltaResistencia}
          icono={BrainCircuit}
          tono="resistencia"
          umbral={{ valor: UMBRAL_NIEBLA_MENTAL, etiqueta: 'Umbral de niebla mental' }}
          ayuda="Tu salud mental y física. Debajo del 30% entra la niebla mental; en 0% se acaba todo."
        />
        <BarraRecurso
          etiqueta="Solidez técnica"
          valor={estado.solidezTecnica}
          delta={ultimoTurno?.deltaSolidezTecnica}
          icono={ScrollText}
          tono="solidez"
          ayuda="Calidad jurídica del articulado. Si no alcanza, la comisión devuelve el dictamen."
        />
      </div>
    </header>
  );
}
