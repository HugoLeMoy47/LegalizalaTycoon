/**
 * Utilidad de diagnóstico: imprime dónde se atoró una política.
 *
 *   npx tsx src/sim/diagnostico.ts --politica="Pragmático"
 */

import { POLITICAS, ESTRATEGA_COLECTIVO } from './politicas';
import { simularPartida } from './simulador';

const args = process.argv.slice(2);
const nombre = args.find((a) => a.startsWith('--politica='))?.split('=')[1];
const semilla = Number(args.find((a) => a.startsWith('--semilla='))?.split('=')[1] ?? 20260906);
const politica =
  POLITICAS.find((p) => p.nombre.toLowerCase() === nombre?.toLowerCase()) ?? ESTRATEGA_COLECTIVO;

const r = simularPartida(politica, { semilla });
const e = r.estadoFinal;

console.log(`\nPolítica: ${politica.nombre}  ·  semilla ${semilla}`);
console.log(`Desenlace: ${r.desenlace} en la semana ${e.semanaActual}`);
console.log(`Iniciativa mutilada: ${e.iniciativaMutilada ? 'SÍ' : 'no'}`);
console.log(
  `Comisión activa: ${e.comisionActiva?.nombre ?? '—'} | dictamen: ${e.comisionActiva?.dictamenAprobado} | pleno requiere: ${e.comisionActiva?.presionPlenoRequerida}% | presión final: ${Math.round(e.recursos.presionPolitica)}%`,
);
console.log(`Comisiones resueltas: ${e.comisionesResueltas.map((c) => c.id).join(', ') || '—'}`);
console.log(
  `Nodos aprobados: ${e.rutaLegislativa.filter((n) => n.estado === 'APROBADO').map((n) => n.id).join(', ') || '—'}`,
);
console.log(`Decisiones: ${r.decisionesTomadas.map((d) => `S${d.semana} ${d.decision}=${d.opcion}`).join(' | ') || '—'}`);
console.log('\nAvisos de agenda del Pleno:');
for (const x of e.registro.filter((y) => y.titulo.includes('Pleno'))) {
  console.log(`  S${x.semana}  ${x.texto}`);
}
console.log('');
