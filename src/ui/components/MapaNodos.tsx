/**
 * Vista B — Mapa de Nodos y Ruta Táctica (Bitácora #007).
 *
 * SVG interactivo dibujado directo en el DOM, sin librerías de grafos
 * (Bitácora #010): tres columnas, una por orden de gobierno, con el embudo
 * Mesa Directiva → Comisión → Pleno y sus cuellos de botella.
 */

import type { EstadoNodo, FaseJuego, GameState, NodoRuta } from '../../engine';

const ANCHO_CAJA = 168;
const ALTO_CAJA = 46;
const SEPARACION_Y = 68;
const COLUMNAS: Record<FaseJuego, number> = { MUNICIPAL: 100, ESTATAL: 312, FEDERAL: 524 };
const TITULO_COLUMNA: Record<FaseJuego, string> = {
  MUNICIPAL: 'Municipal',
  ESTATAL: 'Estatal',
  FEDERAL: 'Federal',
};
const FASES: FaseJuego[] = ['MUNICIPAL', 'ESTATAL', 'FEDERAL'];

const ESTILO_NODO: Record<EstadoNodo, { relleno: string; borde: string; texto: string }> = {
  PENDIENTE: { relleno: '#18243a', borde: '#2e4062', texto: '#94a3b8' },
  ACTIVO: { relleno: '#22314c', borde: '#8fa04a', texto: '#f4ecd8' },
  APROBADO: { relleno: '#193c2b', borde: '#2fbf71', texto: '#bbf7d0' },
  CONGELADO: { relleno: '#3b1620', borde: '#d1495b', texto: '#fecdd3' },
  OMITIDO: { relleno: '#141c2c', borde: '#243049', texto: '#4b5563' },
};

const LEYENDA: { estado: EstadoNodo; texto: string }[] = [
  { estado: 'APROBADO', texto: 'Superado' },
  { estado: 'ACTIVO', texto: 'En curso' },
  { estado: 'PENDIENTE', texto: 'Pendiente' },
  { estado: 'CONGELADO', texto: 'Congeladora' },
  { estado: 'OMITIDO', texto: 'Precluido' },
];

/** Parte la etiqueta en dos renglones sin cortar palabras. */
function partirEtiqueta(texto: string, maximo = 22): [string, string] {
  if (texto.length <= maximo) return [texto, ''];
  const palabras = texto.split(' ');
  let primera = '';
  let indice = 0;
  while (indice < palabras.length && (primera + palabras[indice]).length <= maximo) {
    primera += (primera ? ' ' : '') + palabras[indice];
    indice += 1;
  }
  const segunda = palabras.slice(indice).join(' ');
  return [primera || texto.slice(0, maximo), segunda];
}

export function MapaNodos({ estado }: { estado: GameState }) {
  const porFase = FASES.map((fase) => ({
    fase,
    nodos: estado.rutaLegislativa.filter((n) => n.fase === fase),
  }));
  const filasMaximas = Math.max(...porFase.map((c) => c.nodos.length));
  const alto = filasMaximas * SEPARACION_Y + 74;

  const posicion = (nodo: NodoRuta): { x: number; y: number } => {
    const columna = porFase.find((c) => c.fase === nodo.fase)!;
    const fila = columna.nodos.indexOf(nodo);
    return { x: COLUMNAS[nodo.fase], y: 66 + fila * SEPARACION_Y };
  };

  return (
    <div className="p-3">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 700 ${alto}`}
          className="mx-auto h-auto w-full min-w-[640px] max-w-[820px]"
          role="img"
          aria-label="Mapa de la ruta legislativa de la iniciativa"
        >
          {/* Encabezados de columna */}
          {FASES.map((fase) => (
            <g key={fase}>
              <text
                x={COLUMNAS[fase] + ANCHO_CAJA / 2}
                y={26}
                textAnchor="middle"
                className="fill-slate-400 font-tactica text-[11px] uppercase"
                style={{ letterSpacing: '0.16em' }}
              >
                {TITULO_COLUMNA[fase]}
              </text>
              <line
                x1={COLUMNAS[fase]}
                y1={36}
                x2={COLUMNAS[fase] + ANCHO_CAJA}
                y2={36}
                stroke={estado.faseActual === fase ? '#8fa04a' : '#2e4062'}
                strokeWidth={estado.faseActual === fase ? 2 : 1}
              />
            </g>
          ))}

          {/* Conectores */}
          {porFase.flatMap(({ nodos }, indiceColumna) =>
            nodos.map((nodo, indice) => {
              const origen = posicion(nodo);
              const siguiente = nodos[indice + 1];

              if (siguiente) {
                const destino = posicion(siguiente);
                return (
                  <line
                    key={`c-${nodo.id}`}
                    x1={origen.x + ANCHO_CAJA / 2}
                    y1={origen.y + ALTO_CAJA}
                    x2={destino.x + ANCHO_CAJA / 2}
                    y2={destino.y}
                    stroke={nodo.estado === 'APROBADO' ? '#2fbf71' : '#2e4062'}
                    strokeWidth={1.5}
                    strokeDasharray={nodo.estado === 'APROBADO' ? '0' : '4 4'}
                  />
                );
              }

              // Salto de orden de gobierno (columna → columna).
              const columnaSiguiente = porFase[indiceColumna + 1];
              if (!columnaSiguiente || columnaSiguiente.nodos.length === 0) return null;
              const destino = posicion(columnaSiguiente.nodos[0]);
              return (
                <path
                  key={`s-${nodo.id}`}
                  d={`M ${origen.x + ANCHO_CAJA} ${origen.y + ALTO_CAJA / 2}
                      C ${origen.x + ANCHO_CAJA + 22} ${origen.y + ALTO_CAJA / 2},
                        ${destino.x - 22} ${destino.y + ALTO_CAJA / 2},
                        ${destino.x} ${destino.y + ALTO_CAJA / 2}`}
                  fill="none"
                  stroke={nodo.estado === 'APROBADO' ? '#2fbf71' : '#2e4062'}
                  strokeWidth={1.5}
                  strokeDasharray={nodo.estado === 'APROBADO' ? '0' : '4 4'}
                />
              );
            }),
          )}

          {/* Nodos */}
          {estado.rutaLegislativa.map((nodo) => {
            const { x, y } = posicion(nodo);
            const estilo = ESTILO_NODO[nodo.estado];
            const [linea1, linea2] = partirEtiqueta(nodo.etiqueta);
            const esPromulgacion = nodo.tipo === 'PROMULGACION';

            return (
              <g key={nodo.id}>
                <title>
                  {nodo.etiqueta} — {nodo.estado}
                </title>
                <rect
                  x={x}
                  y={y}
                  width={ANCHO_CAJA}
                  height={ALTO_CAJA}
                  rx={esPromulgacion ? 22 : 5}
                  fill={estilo.relleno}
                  stroke={estilo.borde}
                  strokeWidth={nodo.estado === 'ACTIVO' ? 2 : 1}
                />
                <text
                  x={x + ANCHO_CAJA / 2}
                  y={linea2 ? y + 20 : y + 27}
                  textAnchor="middle"
                  fill={estilo.texto}
                  className="font-tactica text-[11px]"
                >
                  {linea1}
                </text>
                {linea2 && (
                  <text
                    x={x + ANCHO_CAJA / 2}
                    y={y + 34}
                    textAnchor="middle"
                    fill={estilo.texto}
                    className="font-tactica text-[11px]"
                  >
                    {linea2}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {LEYENDA.map(({ estado: clave, texto }) => (
          <li key={clave} className="flex items-center gap-1.5 font-tactica text-[10px] text-slate-500">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm border"
              style={{
                backgroundColor: ESTILO_NODO[clave].relleno,
                borderColor: ESTILO_NODO[clave].borde,
              }}
            />
            {texto}
          </li>
        ))}
      </ul>
    </div>
  );
}
