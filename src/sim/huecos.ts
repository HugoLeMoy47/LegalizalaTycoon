/**
 * Diagnóstico temporal: mide las semanas sin comisión activa ("recesos") por
 * fase, para dimensionar la deuda técnica del ritmo (ARQUITECTURA §10.1).
 *
 *   npx tsx src/sim/huecos.ts
 */

import type { FaseJuego } from '../engine';
import { ESTRATEGA_COLECTIVO, PRAGMATICO } from './politicas';
import { simularPartida } from './simulador';

const SEMILLAS = [20260906, 777, 1, 42, 2026, 555_555];

interface Tramo {
  fase: FaseJuego;
  desde: number;
  hasta: number;
}

function tramosSinComision(traza: { semana: number; fase: FaseJuego; relojCongeladora: number | null }[]): Tramo[] {
  const tramos: Tramo[] = [];
  let actual: Tramo | null = null;

  for (const fila of traza) {
    // Las semanas 1-5 son la Etapa A/B por diseño: no cuentan como receso.
    if (fila.semana <= 6) continue;

    if (fila.relojCongeladora === null) {
      if (actual && actual.fase === fila.fase && actual.hasta === fila.semana - 1) {
        actual.hasta = fila.semana;
      } else {
        actual = { fase: fila.fase, desde: fila.semana, hasta: fila.semana };
        tramos.push(actual);
      }
    } else {
      actual = null;
    }
  }
  return tramos;
}

for (const politica of [ESTRATEGA_COLECTIVO, PRAGMATICO]) {
  console.log(`\n═══ ${politica.nombre} ═══`);
  const acumulado: Record<FaseJuego, number[]> = { MUNICIPAL: [], ESTATAL: [], FEDERAL: [] };

  for (const semilla of SEMILLAS) {
    const r = simularPartida(politica, { semilla });
    const tramos = tramosSinComision(r.traza);
    const total = tramos.reduce((s, t) => s + (t.hasta - t.desde + 1), 0);
    const detalle = tramos
      .filter((t) => t.hasta - t.desde + 1 >= 3)
      .map((t) => `${t.fase.slice(0, 3)} ${t.desde}-${t.hasta} (${t.hasta - t.desde + 1})`)
      .join('  ');
    for (const t of tramos) acumulado[t.fase].push(t.hasta - t.desde + 1);
    console.log(
      `  semilla ${String(semilla).padStart(7)} · ${String(r.desenlace).padEnd(20)} · ${String(total).padStart(3)} sem. muertas  ${detalle}`,
    );
  }

  console.log('  ─────');
  for (const fase of ['MUNICIPAL', 'ESTATAL', 'FEDERAL'] as FaseJuego[]) {
    const suma = acumulado[fase].reduce((s, n) => s + n, 0);
    console.log(
      `  ${fase.padEnd(10)} total ${String(suma).padStart(3)} sem. en ${SEMILLAS.length} partidas · promedio ${(suma / SEMILLAS.length).toFixed(1)} por partida`,
    );
  }
}
console.log('');
