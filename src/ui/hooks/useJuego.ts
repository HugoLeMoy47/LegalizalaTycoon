/**
 * Único puente entre React y el Core Engine.
 *
 * Toda la lógica vive en `src/engine`. Este hook guarda el `GameState`,
 * despacha comandos, persiste la partida en `localStorage` (ejecución 100%
 * client-side, Bitácora #010) y coordina el feedback sensorial de la v2.0:
 * prólogo, wizard y transición animada de semana.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type ComandoJuego,
  type GameState,
  type RegistroEvento,
  type ResumenAvance,
  type ResumenTurno,
  crearEstadoInicial,
  ejecutarComando,
  eventosSinLeer,
} from '../../engine';
import { DURACION_TRANSICION_MS } from '../components/TransicionSemana';
import { sonarSello } from '../audio/sello';

// v2.2: el esquema cambio (Nivel 0, recesos, telemetria). Una partida v2 no
// se puede reanudar sobre el modelo nuevo, asi que la clave sube de version.
const CLAVE_PARTIDA = 'iniciativa-ciudadana:partida:v22';
/** La guía v2.0 nombra explícitamente esta clave. */
const CLAVE_TUTORIAL = 'tutorial_visto';

interface Aviso {
  id: number;
  texto: string;
}

export interface Transicion {
  resumen: ResumenTurno;
  semanaEntrante: number;
  relojCongeladora: number | null;
  /** Presente solo si la corrida abarcó varias semanas. */
  avance: ResumenAvance | null;
  /** Sucesos notables ocurridos durante la corrida. */
  sucesos: RegistroEvento[];
}

function leerBandera(clave: string): boolean {
  try {
    return localStorage.getItem(clave) === 'true';
  } catch {
    return false;
  }
}

function escribirBandera(clave: string, valor: boolean): void {
  try {
    localStorage.setItem(clave, String(valor));
  } catch {
    /* sin persistencia disponible */
  }
}

function cargarPartidaGuardada(): GameState | null {
  try {
    const crudo = localStorage.getItem(CLAVE_PARTIDA);
    if (!crudo) return null;
    const guardado = JSON.parse(crudo) as GameState;
    // Validación mínima: si el esquema cambió, se descarta y se empieza limpio.
    if (typeof guardado?.semanaActual !== 'number' || !guardado?.recursos) return null;
    if (typeof guardado.comisionDesbloqueada !== 'boolean') return null;
    if (!guardado.nivel0 || !Array.isArray(guardado.telemetria)) return null;
    // Partidas anteriores al marcador de lectura: se dan por leidas.
    if (typeof guardado.registroLeidoHasta !== 'number') {
      guardado.registroLeidoHasta = guardado.registro?.length ?? 0;
    }
    return guardado;
  } catch {
    return null;
  }
}

export function useJuego() {
  const [estado, setEstado] = useState<GameState>(
    () => cargarPartidaGuardada() ?? crearEstadoInicial(),
  );
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [transicion, setTransicion] = useState<Transicion | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [tutorialVisto, setTutorialVisto] = useState(() => leerBandera(CLAVE_TUTORIAL));

  const contadorAviso = useRef(0);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  // Persistencia silenciosa: si falla (modo privado, cuota) el juego sigue.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PARTIDA, JSON.stringify(estado));
    } catch {
      /* la partida sigue viva en memoria */
    }
  }, [estado]);

  const mostrarAviso = useCallback((texto: string) => {
    contadorAviso.current += 1;
    const id = contadorAviso.current;
    setAvisos((previos) => [...previos, { id, texto }]);
    setTimeout(() => setAvisos((previos) => previos.filter((a) => a.id !== id)), 4200);
  }, []);

  const despachar = useCallback(
    (comando: ComandoJuego) => {
      // El bloqueo de 600 ms evita el doble clic en "Avanzar Semana".
      if (bloqueado) return;

      const anterior = estadoRef.current;
      const resultado = ejecutarComando(anterior, comando);

      if (!resultado.ok) {
        if (resultado.mensaje) mostrarAviso(resultado.mensaje);
        return;
      }

      setEstado(resultado.estado);

      const avanzoElReloj =
        comando.tipo === 'AVANZAR_SEMANA' || comando.tipo === 'AVANZAR_HASTA_EVENTO';

      if (avanzoElReloj && resultado.estado.ultimoTurno) {
        sonarSello();
        setBloqueado(true);
        setTransicion({
          resumen: resultado.estado.ultimoTurno,
          semanaEntrante: resultado.estado.semanaActual,
          relojCongeladora: resultado.estado.comisionDesbloqueada
            ? (resultado.estado.comisionActiva?.relojCongeladoraSemanas ?? null)
            : null,
          avance: resultado.estado.ultimoAvance,
          sucesos: eventosSinLeer(resultado.estado),
        });
        setTimeout(() => setBloqueado(false), DURACION_TRANSICION_MS);
      }
    },
    [bloqueado, mostrarAviso],
  );

  const terminarTutorial = useCallback(() => {
    escribirBandera(CLAVE_TUTORIAL, true);
    setTutorialVisto(true);
    setEstado((actual) => ejecutarComando(actual, { tipo: 'COMPLETAR_ONBOARDING' }).estado);
  }, []);

  const repetirTutorial = useCallback(() => {
    escribirBandera(CLAVE_TUTORIAL, false);
    setTutorialVisto(false);
  }, []);

  const reiniciar = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE_PARTIDA);
    } catch {
      /* sin persistencia disponible */
    }
    setEstado(crearEstadoInicial({ semilla: Date.now() % 100_000_000 }));
    setAvisos([]);
    setTransicion(null);
  }, []);

  const enJuego = useMemo(
    () => estado.estadoJuego === 'JUGANDO' || estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48',
    [estado.estadoJuego],
  );

  /*
   * Sumidero de telemetria (GUIA v2.2 seccion 6).
   *
   * El motor solo acumula eventos anonimos en el estado; aqui se estampa el
   * reloj y se entregan una sola vez. Hoy van a la consola: ni cookies, ni
   * identificadores, ni texto libre del jugador. Cambiar de destino es cambiar
   * este efecto y nada mas.
   */
  const telemetriaEntregada = useRef(0);
  useEffect(() => {
    const pendientes = estado.telemetria.slice(telemetriaEntregada.current);
    if (pendientes.length === 0) return;
    telemetriaEntregada.current = estado.telemetria.length;
    for (const evento of pendientes) {
      console.info('[TELEMETRIA]', { ...evento, timestamp: Date.now() });
    }
  }, [estado.telemetria]);

  return {
    estado,
    despachar,
    reiniciar,
    avisos,
    enJuego,
    bloqueado,
    transicion,
    limpiarTransicion: useCallback(() => setTransicion(null), []),
    enPrologo: estado.estadoJuego === 'PROLOGO_NIVEL_0',
    tutorialVisto,
    terminarTutorial,
    repetirTutorial,
  };
}

export type JuegoAPI = ReturnType<typeof useJuego>;
