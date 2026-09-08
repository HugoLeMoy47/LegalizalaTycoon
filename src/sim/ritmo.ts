/**
 * Diagnóstico de ritmo: en qué semana abre y cierra cada fase, y cuánto dura
 * cada etapa del embudo. Complementa a `sim:huecos`, que solo cuenta semanas
 * sin comisión activa.
 *
 *   npm run sim:ritmo
 */

import type { FaseJuego } from '../engine';
import { ESTRATEGA_COLECTIVO } from './politicas';
import { simularPartida } from './simulador';

const SEMILLAS = [20260906, 777, 1, 42, 2026, 555_555];

console.log('\n═══ Ritmo del embudo · Estratega colectivo ═══');

for (const semilla of SEMILLAS) {
  const r = simularPartida(ESTRATEGA_COLECTIVO, { semilla });

  const aperturas: Partial<Record<FaseJuego, number>> = {};
  for (const fila of r.traza) {
    if (aperturas[fila.fase] === undefined) aperturas[fila.fase] = fila.semana;
  }

  const etapas = r.estadoFinal.registro
    .filter((e) =>
      [
        'Dictamen aprobado en comisión',
        'Cierra el parlamento abierto',
        'Hacienda emite opinión favorable',
        'Hacienda devuelve el expediente sin materia',
        'Aprobado en el Pleno',
      ].includes(e.titulo),
    )
    .map((e) => `S${e.semana}·${e.titulo.slice(0, 12)}`)
    .join(' ');

  console.log(
    `  semilla ${String(semilla).padStart(8)} · ${String(r.desenlace).padEnd(20)} sem ${String(
      r.semanasJugadas,
    ).padStart(3)} · MUN ${aperturas.MUNICIPAL ?? '-'} EST ${aperturas.ESTATAL ?? '-'} FED ${
      aperturas.FEDERAL ?? '-'
    }`,
  );
  console.log(`      ${etapas}`);
}
console.log('');
