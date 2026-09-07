import { Gavel, HeartHandshake, Megaphone, UserPlus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  ETIQUETA_VERBO,
  SEMANA_DESBLOQUEO_COLECTIVO,
  VERBOS,
  formatearPesos,
  type ComandoJuego,
  type GameState,
  type MiembroColectivo,
  type RolColectivo,
  type VerboAccion,
} from '../../engine';
import { PanelBloqueado } from './PanelBloqueado';

const ICONO_ROL: Record<RolColectivo, LucideIcon> = {
  LIDER: Users,
  ABOGADA: Gavel,
  VOCERO: Megaphone,
  ENLACE_BASE: HeartHandshake,
};

const ETIQUETA_ROL: Record<RolColectivo, string> = {
  LIDER: 'Coordinación',
  ABOGADA: 'Abogada pro-bono',
  VOCERO: 'Vocería',
  ENLACE_BASE: 'Enlace de base',
};

interface Props {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}

export function PanelColectivo({ estado, despachar }: Props) {
  const aliados = estado.colectivo.filter((m) => m.rol !== 'LIDER');

  // Etapa A: el jugador todavía es una sola persona (GUIA v2.0 sección 5.B).
  if (!estado.colectivoDesbloqueado) {
    return (
      <PanelBloqueado
        titulo="Cuartel del colectivo"
        icono={<Users className="h-3.5 w-3.5" aria-hidden />}
        motivo="Requiere base social mínima"
        semanaApertura={SEMANA_DESBLOQUEO_COLECTIVO}
        semanaActual={estado.semanaActual}
      />
    );
  }

  return (
    <section className="panel">
      <h2 className="panel-titulo">
        <Users className="h-3.5 w-3.5" aria-hidden />
        Cuartel del colectivo
        <span className="ml-auto font-tactica text-[10px] normal-case tracking-normal text-slate-500">
          Sus horas no salen de tu resistencia
        </span>
      </h2>

      <ul className="divide-y divide-pizarra-700/70">
        {aliados.map((miembro) => (
          <li key={miembro.id} className="px-4 py-3">
            {miembro.activo ? (
              <FichaAliadoActivo miembro={miembro} despachar={despachar} />
            ) : (
              <FichaReclutable miembro={miembro} estado={estado} despachar={despachar} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FichaAliadoActivo({
  miembro,
  despachar,
}: {
  miembro: MiembroColectivo;
  despachar: (comando: ComandoJuego) => void;
}) {
  const Icono = ICONO_ROL[miembro.rol];

  const cambiarVerbo = (verbo: VerboAccion | null) =>
    despachar({
      tipo: 'ASIGNAR_HORAS_ALIADO',
      miembroId: miembro.id,
      verbo,
      horas: verbo ? miembro.capacidadHoras : 0,
    });

  return (
    <div>
      <div className="flex items-center gap-2">
        <Icono className="h-4 w-4 shrink-0 text-olivo-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-tactica text-xs font-semibold text-papel-100">
            {miembro.nombre}
          </p>
          <p className="etiqueta">{ETIQUETA_ROL[miembro.rol]}</p>
        </div>
        <span className="shrink-0 font-tactica text-[11px] tabular-nums text-slate-400">
          {miembro.capacidadHoras}h
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => cambiarVerbo(null)}
          className={`rounded border px-2 py-0.5 font-tactica text-[10px] transition ${
            miembro.verboAsignado === null
              ? 'border-slate-500 bg-pizarra-600 text-slate-200'
              : 'border-pizarra-600 text-slate-500 hover:border-slate-500'
          }`}
        >
          Sin asignar
        </button>
        {VERBOS.map((verbo) => (
          <button
            key={verbo}
            type="button"
            onClick={() => cambiarVerbo(verbo)}
            className={`rounded border px-2 py-0.5 font-tactica text-[10px] transition ${
              miembro.verboAsignado === verbo
                ? 'border-olivo-400 bg-olivo-600/40 text-papel-100'
                : 'border-pizarra-600 text-slate-500 hover:border-olivo-400 hover:text-slate-300'
            }`}
          >
            {ETIQUETA_VERBO[verbo]}
          </button>
        ))}
      </div>
    </div>
  );
}

function FichaReclutable({
  miembro,
  estado,
  despachar,
}: {
  miembro: MiembroColectivo;
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}) {
  const Icono = ICONO_ROL[miembro.rol];
  const apoyoOk = estado.recursos.apoyoSocial >= miembro.apoyoSocialMinimo;
  const fondosOk = estado.recursos.fondos >= miembro.costoFondos;

  return (
    <div className="opacity-90">
      <div className="flex items-start gap-2">
        <Icono className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-tactica text-xs font-semibold text-slate-300">
            {miembro.nombre}
          </p>
          <p className="etiqueta">{ETIQUETA_ROL[miembro.rol]}</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">{miembro.especialidad}</p>

          <p className="mt-1.5 flex flex-wrap gap-x-3 font-tactica text-[10px]">
            <span className={apoyoOk ? 'text-favor' : 'text-opositor'}>
              Apoyo ≥ {miembro.apoyoSocialMinimo}%
            </span>
            <span className={fondosOk ? 'text-favor' : 'text-opositor'}>
              {formatearPesos(miembro.costoFondos)}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="boton boton-primario shrink-0"
          disabled={!apoyoOk || !fondosOk}
          onClick={() => despachar({ tipo: 'RECLUTAR', miembroId: miembro.id })}
        >
          <UserPlus className="h-3 w-3" aria-hidden />
          Reclutar
        </button>
      </div>
    </div>
  );
}
