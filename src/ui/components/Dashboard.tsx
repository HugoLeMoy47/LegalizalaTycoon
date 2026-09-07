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

      <div data-tour="triada" className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
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
