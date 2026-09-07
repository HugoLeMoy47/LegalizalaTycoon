/**
 * Wizard de Onboarding con Spotlight (GUIA v2.0 sección 3).
 *
 * Cuatro pasos que iluminan un componente a la vez oscureciendo el resto al
 * 70%. El "hueco" del spotlight se logra con un `box-shadow` gigante sobre un
 * div posicionado en el rectángulo del elemento: no requiere máscaras SVG ni
 * clonar nodos, y sigue al elemento si la página se redimensiona.
 *
 * Los objetivos se marcan en el árbol con `data-tour="<id>"`.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

interface PasoWizard {
  objetivo: string;
  titulo: string;
  cuerpo: React.ReactNode;
}

const PASOS: PasoWizard[] = [
  {
    objetivo: 'triada',
    titulo: 'Tus tres signos vitales',
    cuerpo: (
      <ul className="space-y-1.5">
        <li>
          <b className="text-sky-400">Apoyo Social:</b> tu legitimidad comunitaria y la gente en las
          calles.
        </li>
        <li>
          <b className="text-alerta">Presión Política:</b> tu capacidad de incidir en los pasillos
          del poder.
        </li>
        <li>
          <b className="text-favor">Resistencia:</b> tu salud mental.{' '}
          <b className="text-opositor">Si llega a 0% colapsas por burnout</b> y el movimiento se
          desintegra. Debajo de 30% sufrirás Niebla Mental.
        </li>
      </ul>
    ),
  },
  {
    objetivo: 'horas',
    titulo: 'La moneda del activista',
    cuerpo: (
      <>
        <p>
          Tienes <b>40 horas base</b> a la semana para repartir entre recolección de firmas,
          redacción jurídica, cabildeo y autocuidado.
        </p>
        <p className="mt-2">
          Puedes pulsar <b className="text-opositor">[ + Meter Horas Extra ]</b> para conseguir más
          tiempo, pero <b>cada desvelo drena tu Resistencia de inmediato</b>. Cuidado con la trampa
          del mártir.
        </p>
      </>
    ),
  },
  {
    objetivo: 'vista-dual',
    titulo: 'El laberinto legislativo',
    cuerpo: (
      <>
        <p>Aquí sigues el avance real de tu iniciativa.</p>
        <p className="mt-2">
          Usa el <b>Expediente Físico</b> para revisar sellos institucionales y notas al margen, o el{' '}
          <b>Mapa de Nodos</b> para ver los cuellos de botella parlamentarios de las tres instancias.
        </p>
      </>
    ),
  },
  {
    objetivo: 'avanzar',
    titulo: 'El reloj de la legislatura',
    cuerpo: (
      <>
        <p>
          Cada turno equivale a <b>7 días de política mexicana</b>.
        </p>
        <p className="mt-2">
          Los diputados no trabajarán por ti: si descuidas los plazos de comisiones, tu iniciativa
          caerá a la <b className="text-opositor">Congeladora</b> y quedará archivada.
        </p>
        <p className="mt-2">Pulsa el botón cuando hayas distribuido tus horas. ¡Que comience la lucha!</p>
      </>
    ),
  },
];

const RELLENO = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  onTerminar: () => void;
  /**
   * Avisa qué objetivo se está iluminando. En móvil el tablero vive en
   * pestañas, así que la app tiene que abrir la que contiene el objetivo antes
   * de que el spotlight lo busque en el DOM.
   */
  onObjetivo?: (objetivo: string) => void;
}

export function WizardOnboarding({ onTerminar, onObjetivo }: Props) {
  const [indice, setIndice] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const paso = PASOS[indice];

  useEffect(() => {
    onObjetivo?.(paso.objetivo);
  }, [paso.objetivo, onObjetivo]);

  const medir = useCallback(() => {
    const nodo = document.querySelector<HTMLElement>(`[data-tour="${paso.objetivo}"]`);
    if (!nodo) {
      setRect(null);
      return;
    }
    const r = nodo.getBoundingClientRect();
    setRect({
      top: r.top - RELLENO,
      left: r.left - RELLENO,
      width: r.width + RELLENO * 2,
      height: r.height + RELLENO * 2,
    });
  }, [paso.objetivo]);

  /**
   * Desplaza el objetivo a la vista y mide.
   *
   * El scroll es instantáneo a propósito: con `behavior: 'smooth'` la medición
   * ocurría a mitad de la animación y el spotlight quedaba sobre una franja
   * equivocada de la página, sobre todo en el paso 4 (el botón de avanzar vive
   * hasta el fondo del documento).
   */
  useLayoutEffect(() => {
    const nodo = document.querySelector<HTMLElement>(`[data-tour="${paso.objetivo}"]`);
    nodo?.scrollIntoView({ block: 'center', behavior: 'auto' });
    const cuadro = requestAnimationFrame(medir);
    // Segunda medición por si algún panel terminó de asentarse.
    const t = setTimeout(medir, 180);
    return () => {
      cancelAnimationFrame(cuadro);
      clearTimeout(t);
    };
  }, [paso.objetivo, medir]);

  useEffect(() => {
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir, true);
    };
  }, [medir]);

  // Navegación por teclado.
  useEffect(() => {
    const teclas = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onTerminar();
      if (evento.key === 'ArrowRight' || evento.key === 'Enter') {
        setIndice((i) => (i + 1 < PASOS.length ? i + 1 : i));
      }
      if (evento.key === 'ArrowLeft') setIndice((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  }, [onTerminar]);

  const esUltimo = indice === PASOS.length - 1;
  const siguiente = () => (esUltimo ? onTerminar() : setIndice((i) => i + 1));

  // La tarjeta va debajo del hueco salvo que no quepa; siempre dentro del viewport.
  const estiloTarjeta = useMemo<React.CSSProperties>(() => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const alturaTarjeta = 280;
    const margen = 12;
    const cabeDebajo = rect.top + rect.height + alturaTarjeta + margen < window.innerHeight;
    const propuesta = cabeDebajo ? rect.top + rect.height + 14 : rect.top - alturaTarjeta - 14;

    return {
      top: Math.max(margen, Math.min(propuesta, window.innerHeight - alturaTarjeta - margen)),
      left: Math.max(margen, Math.min(rect.left, window.innerWidth - 372)),
    };
  }, [rect]);

  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Tutorial guiado">
      {/* Oscurecimiento con hueco: el box-shadow cubre todo menos el rectángulo */}
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-olivo-400 transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(3, 6, 12, 0.7)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(3,6,12,0.7)]" />
      )}

      {/* Tarjeta explicativa */}
      <div
        className="panel absolute w-[360px] max-w-[calc(100vw-24px)] border-olivo-500/60 p-4 shadow-2xl shadow-black/70"
        style={estiloTarjeta}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="etiqueta text-olivo-400">
              Paso {indice + 1} de {PASOS.length}
            </p>
            <h2 className="mt-0.5 font-tactica text-base font-semibold leading-tight text-papel-100">
              {paso.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onTerminar}
            className="flex shrink-0 items-center gap-1 rounded px-1.5 py-1 font-tactica text-[10px] uppercase tracking-[0.12em] text-slate-500 transition hover:bg-pizarra-600 hover:text-slate-200"
          >
            <X className="h-3 w-3" aria-hidden />
            Omitir
          </button>
        </div>

        <div className="mt-3 text-[12px] leading-relaxed text-slate-300">{paso.cuerpo}</div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden>
            {PASOS.map((p, i) => (
              <span
                key={p.objetivo}
                className={`h-1.5 rounded-full transition-all ${
                  i === indice ? 'w-5 bg-olivo-400' : 'w-1.5 bg-pizarra-500'
                }`}
              />
            ))}
          </div>
          <button type="button" className="boton boton-primario" onClick={siguiente}>
            {esUltimo ? 'Empezar' : 'Siguiente'}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
