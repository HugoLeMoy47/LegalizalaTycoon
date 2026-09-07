/**
 * Vista A — Expediente Burocrático Físico (Bitácora #007).
 *
 * Carpeta tipo cartulina manila con sellos de tinta generados por CSS
 * (tipografía Special Elite + doble borde + rotación), sin imágenes.
 */

import { META_FIRMAS, SEMANAS_TOTALES, type GameState, type SelloExpediente } from '../../engine';

const FICHA_SELLO: Record<
  SelloExpediente,
  { texto: string; tinta: 'roja' | 'azul' | 'verde'; giro: string }
> = {
  TURNADO: { texto: 'Turnado a comisión', tinta: 'azul', giro: '-7deg' },
  EN_COMISION: { texto: 'En comisión', tinta: 'azul', giro: '4deg' },
  DICTAMEN_CON_ENMIENDAS: { texto: 'Dictamen con enmiendas', tinta: 'roja', giro: '-3deg' },
  CONGELADORA: { texto: 'A la congeladora', tinta: 'roja', giro: '-11deg' },
  APROBADO: { texto: 'Aprobado', tinta: 'verde', giro: '6deg' },
  PUBLICADO_DOF: { texto: 'Publicado en el DOF', tinta: 'verde', giro: '-5deg' },
};

const CLASE_TINTA = {
  roja: 'sello-tinta-roja',
  azul: 'sello-tinta-azul',
  verde: 'sello-tinta-verde',
} as const;

export function ExpedienteFisico({ estado }: { estado: GameState }) {
  const comision = estado.comisionActiva;

  return (
    <div className="p-4">
      <article className="carpeta relative overflow-hidden px-6 py-5">
        {/* Perforaciones de la carpeta */}
        <span className="absolute left-2 top-10 h-3 w-3 rounded-full bg-pizarra-900/25" />
        <span className="absolute left-2 top-24 h-3 w-3 rounded-full bg-pizarra-900/25" />

        <header className="border-b-2 border-pizarra-900/25 pb-3 pl-4">
          <p className="font-oficial text-[11px] uppercase tracking-[0.2em] text-pizarra-900/60">
            Congreso · Expediente legislativo
          </p>
          <h3 className="mt-1 font-oficial text-lg leading-tight text-pizarra-900">
            Iniciativa ciudadana con proyecto de decreto en materia de Regulación Integral del
            Cannabis
          </h3>
        </header>

        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 pl-4 font-oficial text-[13px] sm:grid-cols-2">
          <Campo etiqueta="Expediente" valor={`ICM-${String(estado.semilla).slice(-4)}/2026`} />
          <Campo
            etiqueta="Promovente"
            valor={
              estado.iniciativaMutilada
                ? 'Colectivo ciudadano (texto modificado en comisiones)'
                : 'Colectivo ciudadano'
            }
          />
          <Campo
            etiqueta="Turnado a"
            valor={
              estado.comisionDesbloqueada
                ? (comision?.nombre ?? 'Sin turno vigente')
                : 'Sin turnar · pendiente de Oficialía de Partes'
            }
          />
          <Campo
            etiqueta="Fecha de sesión"
            valor={`Semana ${estado.semanaActual} de ${SEMANAS_TOTALES}`}
          />
          <Campo
            etiqueta={estado.comisionDesbloqueada ? 'Votos en comisión' : 'Firmas recolectadas'}
            valor={
              estado.comisionDesbloqueada
                ? comision
                  ? `${comision.legisladores.filter((l) => l.postura === 'FAVOR').length} de ${comision.votosFavorRequeridos} requeridos`
                  : '—'
                : `${estado.firmasRecolectadas} de ${META_FIRMAS} requeridas`
            }
          />
          <Campo
            etiqueta="Plazo reglamentario"
            valor={
              !estado.comisionDesbloqueada
                ? 'No corre hasta el turno a comisiones'
                : comision && !comision.dictamenAprobado
                  ? `${comision.relojCongeladoraSemanas} semanas restantes`
                  : '—'
            }
          />
        </dl>

        {/* Sellos de tinta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 pl-4">
          {estado.sellos.map((sello) => {
            const ficha = FICHA_SELLO[sello];
            return (
              <span
                key={sello}
                className={`sello animate-sello ${CLASE_TINTA[ficha.tinta]}`}
                style={{ transform: `rotate(${ficha.giro})` }}
              >
                {ficha.texto}
              </span>
            );
          })}
        </div>

        {/* Nota marginal del asesor */}
        <p className="mt-6 max-w-md border-l-2 border-pizarra-900/25 pl-3 font-oficial text-[12px] italic leading-relaxed text-pizarra-900/70">
          {notaMarginal(estado)}
        </p>

        <footer className="mt-6 flex items-end justify-between gap-4 pl-4">
          <p className="font-oficial text-[11px] uppercase tracking-[0.15em] text-pizarra-900/50">
            Secretaría técnica de la comisión
          </p>
          <span
            className="font-oficial text-2xl text-pizarra-900/45"
            style={{ transform: 'rotate(-4deg)' }}
            aria-hidden
          >
            ~firma~
          </span>
        </footer>
      </article>
    </div>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-pizarra-900/50">{etiqueta}</dt>
      <dd className="truncate text-pizarra-900/90" title={valor}>
        {valor}
      </dd>
    </div>
  );
}

/** Comentario al margen que refleja el estado real del expediente. */
function notaMarginal(estado: GameState): string {
  if (!estado.comisionDesbloqueada) {
    return '“Borrador de trabajo. Falta acreditar el respaldo ciudadano ante Oficialía de Partes para que el asunto pueda turnarse.”';
  }
  if (estado.estadoJuego === 'VICTORIA_DOF') {
    return estado.iniciativaMutilada
      ? '“Publicada. Sin autocultivo y sin presupuesto etiquetado. Técnicamente vigente, materialmente decorativa.”'
      : '“Publicada íntegra. Entra en vigor al día siguiente de su publicación.”';
  }
  if (estado.comisionActiva?.congelada) {
    return '“Precluido el plazo. Archívese como asunto total y definitivamente concluido.”';
  }
  if (estado.iniciativaMutilada) {
    return '“Se eliminaron los artículos 12 y 27. La comisión considera que así el proyecto es viable presupuestalmente.”';
  }
  if (estado.comisionActiva?.dictamenAprobado) {
    return '“Dictamen aprobado en comisión. Pendiente de listarse en el orden del día del Pleno.”';
  }
  if ((estado.comisionActiva?.relojCongeladoraSemanas ?? 99) <= 4) {
    return '“Se recuerda a la presidencia que el plazo para dictaminar está por vencer.”';
  }
  return '“Recibido para estudio y dictamen. Se solicitan opiniones a las áreas correspondientes.”';
}
