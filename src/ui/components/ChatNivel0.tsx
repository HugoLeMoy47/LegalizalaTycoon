/**
 * NIVEL 0 INTERACTIVO — Chat de Red Vecinal de Alerta (GUIA v2.2 sección 2).
 *
 * Sustituye al modal estático del prólogo por una conversación jugable en el
 * formato que la gente ya sabe leer: un grupo de mensajería. Tres micro-pasos
 * tácticos, una salida bloqueada (pagar la mordida) y una epifanía que activa
 * el reloj de las 100 semanas.
 *
 * Sin reglas de juego aquí: todo lo decide el motor (`src/engine/nivel0.ts`).
 */

import { useEffect, useRef } from 'react';
import { Lock, ShieldCheck, Users } from 'lucide-react';

import {
  CIERRE_NIVEL_0,
  GRUPO_NIVEL_0,
  SEMANAS_TOTALES,
  pasoNivel0,
  type ComandoJuego,
  type GameState,
  type MensajeChat,
} from '../../engine';

interface Props {
  estado: GameState;
  despachar: (comando: ComandoJuego) => void;
}

export function ChatNivel0({ estado, despachar }: Props) {
  const paso = pasoNivel0(estado);
  const enEpifania = estado.nivel0.paso === 'EPIFANIA';
  const finDelHilo = useRef<HTMLDivElement>(null);

  // Cada mensaje nuevo baja el hilo, como cualquier app de mensajería.
  useEffect(() => {
    finDelHilo.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [estado.nivel0.mensajes.length]);

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-center bg-black/90 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-chat-nivel0"
    >
      <div className="flex h-dvh w-full max-w-lg flex-col overflow-hidden border-pizarra-600/70 bg-pizarra-900 sm:h-auto sm:max-h-full sm:rounded-lg sm:border">
        {/* Cabecera del grupo */}
        <header className="shrink-0 border-b border-pizarra-600/70 bg-pizarra-800 px-4 py-2.5">
          <p
            id="titulo-chat-nivel0"
            className="flex items-center gap-2 font-tactica text-[13px] font-semibold text-papel-100"
          >
            <Users className="h-4 w-4 text-olivo-400" aria-hidden />
            {GRUPO_NIVEL_0.nombre}
          </p>
          <p className="mt-0.5 truncate font-tactica text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {GRUPO_NIVEL_0.descripcion} · {GRUPO_NIVEL_0.participantes}
          </p>
        </header>

        {/* Barra de progreso de los tres micro-pasos */}
        <ol className="flex shrink-0 gap-1 border-b border-pizarra-600/70 bg-pizarra-800/60 px-3 py-2">
          {[1, 2, 3].map((numero) => {
            const activo = paso?.numero === numero;
            const hecho = enEpifania || (paso?.numero ?? 4) > numero;
            return (
              <li key={numero} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    hecho ? 'bg-olivo-400' : activo ? 'bg-olivo-600' : 'bg-pizarra-600'
                  }`}
                  aria-hidden
                />
                <p
                  className={`mt-1 truncate font-tactica text-[9px] uppercase tracking-[0.1em] ${
                    hecho || activo ? 'text-olivo-400' : 'text-slate-600'
                  }`}
                >
                  {['Documentar', 'Movilizar', 'Escalar'][numero - 1]}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Hilo */}
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
          {estado.nivel0.mensajes.map((mensaje, indice) => (
            <Burbuja key={`${indice}-${mensaje.autor}`} mensaje={mensaje} />
          ))}

          {enEpifania && (
            <section className="mt-4 rounded border border-olivo-500/50 bg-olivo-600/10 px-4 py-3.5 text-center">
              <p className="flex items-center justify-center gap-1.5 font-tactica text-[10px] uppercase tracking-[0.16em] text-olivo-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {CIERRE_NIVEL_0.titulo}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
                {CIERRE_NIVEL_0.texto}
              </p>
            </section>
          )}

          <div ref={finDelHilo} />
        </div>

        {/* Respuestas tácticas */}
        <footer className="shrink-0 border-t border-pizarra-600/70 bg-pizarra-800 px-3 py-3">
          {paso && (
            <>
              <p className="mb-2 font-tactica text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Paso {paso.numero} de 3 · {paso.leccion}
              </p>
              <div className="space-y-2">
                {paso.opciones.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => despachar({ tipo: 'RESPONDER_NIVEL_0', opcionId: opcion.id })}
                    className={`boton boton-tactil w-full items-start justify-start gap-2 whitespace-normal px-3 py-2.5 text-left ${
                      opcion.civica ? '' : 'opacity-70'
                    }`}
                  >
                    {!opcion.civica && (
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alerta" aria-hidden />
                    )}
                    <span className="font-tactica text-[12px] leading-snug">{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {enEpifania && (
            <>
              <button
                type="button"
                autoFocus
                onClick={() => despachar({ tipo: 'ACTIVAR_MANDATO' })}
                className="boton boton-primario boton-tactil w-full py-3 text-sm"
              >
                ⚖️ {CIERRE_NIVEL_0.boton}
              </button>
              <p className="mt-2 text-center font-tactica text-[10px] uppercase tracking-[0.14em] text-slate-600">
                {SEMANAS_TOTALES} semanas · Art. 71 fracción IV constitucional
              </p>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

function Burbuja({ mensaje }: { mensaje: MensajeChat }) {
  // Las notas de la Red Vecinal son el hilo pedagógico: nombran la mecánica que
  // el jugador acaba de usar sin sacarlo de la ficción.
  if (mensaje.esNota) {
    return (
      <p className="mx-auto max-w-[92%] rounded border border-sky-700/40 bg-sky-950/40 px-3 py-2 text-center text-[11px] leading-relaxed text-sky-200">
        <span className="mr-1" aria-hidden>
          {mensaje.avatar}
        </span>
        {mensaje.texto}
      </p>
    );
  }

  if (mensaje.propio) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg rounded-br-sm bg-olivo-600/30 px-3 py-2 text-[12.5px] leading-relaxed text-papel-100">
          {mensaje.texto}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <span className="mt-0.5 shrink-0 text-lg leading-none" aria-hidden>
        {mensaje.avatar}
      </span>
      <div className="min-w-0 max-w-[85%]">
        <p className="font-tactica text-[10px] font-semibold text-olivo-400">{mensaje.autor}</p>
        <p className="mt-0.5 rounded-lg rounded-tl-sm bg-pizarra-800 px-3 py-2 text-[12.5px] leading-relaxed text-slate-200">
          {mensaje.texto}
        </p>
      </div>
    </div>
  );
}
