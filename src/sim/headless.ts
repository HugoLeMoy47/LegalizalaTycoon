/**
 * PRUEBA 1 DE LA GUIA — Modo Simulacion Headless.
 *
 *   npm run sim            -> corre 100 semanas con el estratega colectivo
 *   npm run sim -- --politica="Líder mártir"
 *   npm run sim:matriz     -> corre las 4 politicas y compara desenlaces
 *
 * Imprime la traza semanal para comprobar a ojo (y por asercion) que los
 * decaimientos matematicos y los cambios de fase ocurren donde deben.
 */

import { DRENAJE_RESISTENCIA_POR_FASE, SEMANAS_TOTALES } from '../engine';
import { POLITICAS, ESTRATEGA_COLECTIVO, type Politica } from './politicas';
import { simularPartida, verificarCalendarioDeFases, type ResultadoSimulacion } from './simulador';

const ANSI = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  bold: '\u001b[1m',
  verde: '\u001b[32m',
  rojo: '\u001b[31m',
  ambar: '\u001b[33m',
  azul: '\u001b[36m',
};

function color(texto: string, codigo: string): string {
  return `${codigo}${texto}${ANSI.reset}`;
}

function barra(valor: number, ancho = 12): string {
  const llenos = Math.max(0, Math.min(ancho, Math.round((valor / 100) * ancho)));
  return '█'.repeat(llenos) + '·'.repeat(ancho - llenos);
}

function colorDesenlace(desenlace: string): string {
  if (desenlace === 'VICTORIA_DOF') return color(desenlace, ANSI.verde);
  if (desenlace.startsWith('DERROTA')) return color(desenlace, ANSI.rojo);
  return color(desenlace, ANSI.ambar);
}

function imprimirEncabezado(resultado: ResultadoSimulacion): void {
  console.log('');
  console.log(color('═'.repeat(96), ANSI.dim));
  console.log(
    `${ANSI.bold}INICIATIVA CIUDADANA: MANDATO DE LEY${ANSI.reset} · simulación headless de ${SEMANAS_TOTALES} semanas`,
  );
  console.log(
    `Política: ${ANSI.bold}${resultado.politica}${ANSI.reset}   Semilla: ${resultado.semilla}`,
  );
  console.log(color('═'.repeat(96), ANSI.dim));
  console.log(
    color(
      'Sem  Fase        Apoyo          Presión        Resistencia     Sol.Téc  Reloj  Votos  Aliados',
      ANSI.dim,
    ),
  );
}

function imprimirTraza(resultado: ResultadoSimulacion, cada = 5): void {
  const hitos = new Set([1, 30, 31, 47, 48, 49, 50, 51, 65, 66, 99, 100]);
  for (const fila of resultado.traza) {
    if (fila.semana % cada !== 0 && !hitos.has(fila.semana)) continue;

    const marcaFase = fila.semana === 31 || fila.semana === 66 ? color(' ⇦ CAMBIO DE FASE', ANSI.azul) : '';
    const marcaDescanso =
      fila.estadoJuego === 'DESCANSO_FORZADO_SEM_48' ? color(' ⇦ DESCANSO FORZADO', ANSI.ambar) : '';
    const marcaNiebla = fila.niebla ? color(' ⇦ NIEBLA MENTAL', ANSI.rojo) : '';

    console.log(
      [
        String(fila.semana).padStart(3),
        fila.fase.padEnd(10),
        `${barra(fila.apoyoSocial)} ${String(Math.round(fila.apoyoSocial)).padStart(3)}%`,
        `${barra(fila.presionPolitica)} ${String(Math.round(fila.presionPolitica)).padStart(3)}%`,
        `${barra(fila.resistencia)} ${String(Math.round(fila.resistencia)).padStart(3)}%`,
        String(Math.round(fila.solidezTecnica)).padStart(6),
        String(fila.relojCongeladora ?? '—').padStart(6),
        String(fila.votosFavor).padStart(6),
        String(fila.aliados).padStart(7),
      ].join('  ') + marcaFase + marcaDescanso + marcaNiebla,
    );
  }
}

function imprimirResumen(resultado: ResultadoSimulacion): void {
  const { estadoFinal } = resultado;
  const calendario = verificarCalendarioDeFases(resultado.traza);

  console.log(color('─'.repeat(96), ANSI.dim));
  console.log(`Desenlace .............. ${colorDesenlace(resultado.desenlace)}`);
  console.log(`Semanas jugadas ........ ${resultado.semanasJugadas}`);
  console.log(
    `Recursos finales ....... Apoyo ${Math.round(estadoFinal.recursos.apoyoSocial)}% · Presión ${Math.round(estadoFinal.recursos.presionPolitica)}% · Resistencia ${Math.round(estadoFinal.recursos.resistencia)}% · Solidez ${Math.round(estadoFinal.solidezTecnica)}%`,
  );
  console.log(
    `Colectivo .............. ${estadoFinal.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length} aliados activos`,
  );
  console.log(`Iniciativa mutilada .... ${estadoFinal.iniciativaMutilada ? 'SÍ' : 'no'}`);
  console.log(
    `Reporte Semana 48 ...... ${
      estadoFinal.reporteSemana48
        ? estadoFinal.reporteSemana48.colectivoSostuvo
          ? color('el colectivo sostuvo la iniciativa', ANSI.verde)
          : color('parálisis del proyecto', ANSI.rojo)
        : 'no emitido'
    }`,
  );
  console.log(
    `Calendario de fases .... ${
      calendario.correcto
        ? color('correcto (cambios en semanas 31 y 66)', ANSI.verde)
        : color(calendario.incidencias.join(' | '), ANSI.rojo)
    }`,
  );
  console.log(
    `Drenaje esperado ....... MUNICIPAL −${DRENAJE_RESISTENCIA_POR_FASE.MUNICIPAL}/sem · ESTATAL −${DRENAJE_RESISTENCIA_POR_FASE.ESTATAL}/sem · FEDERAL −${DRENAJE_RESISTENCIA_POR_FASE.FEDERAL}/sem`,
  );

  if (resultado.decisionesTomadas.length > 0) {
    console.log(color('─'.repeat(96), ANSI.dim));
    console.log('Dilemas resueltos:');
    for (const d of resultado.decisionesTomadas) {
      console.log(`  S${String(d.semana).padStart(3)}  ${d.decision.padEnd(18)} → ${d.opcion}`);
    }
  }

  console.log(color('─'.repeat(96), ANSI.dim));
  console.log('Últimas entradas de bitácora:');
  for (const entrada of estadoFinal.registro.slice(-6)) {
    console.log(color(`  S${String(entrada.semana).padStart(3)} [${entrada.tipo}] ${entrada.titulo}`, ANSI.dim));
    console.log(`       ${entrada.texto}`);
  }
  console.log('');
}

function correrMatriz(semilla: number): void {
  console.log('');
  console.log(`${ANSI.bold}MATRIZ COMPARATIVA DE POLÍTICAS${ANSI.reset}  ·  semilla ${semilla}`);
  console.log(color('═'.repeat(96), ANSI.dim));
  console.log(
    color(
      'Política                Desenlace                Sem   Apoyo  Presión  Resist  Aliados  Mutilada',
      ANSI.dim,
    ),
  );

  for (const politica of POLITICAS) {
    const r = simularPartida(politica, { semilla });
    console.log(
      [
        politica.nombre.padEnd(22),
        colorDesenlace(r.desenlace.padEnd(22)),
        String(r.semanasJugadas).padStart(4),
        `${String(Math.round(r.estadoFinal.recursos.apoyoSocial)).padStart(5)}%`,
        `${String(Math.round(r.estadoFinal.recursos.presionPolitica)).padStart(6)}%`,
        `${String(Math.round(r.estadoFinal.recursos.resistencia)).padStart(5)}%`,
        String(r.estadoFinal.colectivo.filter((m) => m.rol !== 'LIDER' && m.activo).length).padStart(7),
        (r.estadoFinal.iniciativaMutilada ? 'SÍ' : 'no').padStart(9),
      ].join('  '),
    );
  }
  console.log(color('═'.repeat(96), ANSI.dim));
  console.log('');
}

// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const semillaArg = args.find((a) => a.startsWith('--semilla='));
  const politicaArg = args.find((a) => a.startsWith('--politica='));
  const cadaArg = args.find((a) => a.startsWith('--cada='));
  const semilla = semillaArg ? Number(semillaArg.split('=')[1]) : 20260906;

  if (args.includes('--matriz')) {
    correrMatriz(semilla);
    return;
  }

  const nombre = politicaArg?.split('=')[1];
  const politica: Politica =
    POLITICAS.find((p) => p.nombre.toLowerCase() === nombre?.toLowerCase()) ?? ESTRATEGA_COLECTIVO;

  const resultado = simularPartida(politica, { semilla });
  imprimirEncabezado(resultado);
  imprimirTraza(resultado, cadaArg ? Number(cadaArg.split('=')[1]) : 5);
  imprimirResumen(resultado);
}

main();
