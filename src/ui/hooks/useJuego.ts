/**
 * Único puente entre React y el Core Engine.
 *
 * Toda la lógica vive en `src/engine`. Este hook solo guarda el `GameState`
 * en un `useState`, despacha comandos y persiste la partida en `localStorage`
 * (ejecución 100% client-side, Bitácora #010).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type ComandoJuego,
  type GameState,
  crearEstadoInicial,
  ejecutarComando,
} from '../../engine';

const CLAVE_PARTIDA = 'iniciativa-ciudadana:partida:v1';

interface Aviso {
  id: number;
  texto: string;
}

function cargarPartidaGuardada(): GameState | null {
  try {
    const crudo = localStorage.getItem(CLAVE_PARTIDA);
    if (!crudo) return null;
    const guardado = JSON.parse(crudo) as GameState;
    // Validación mínima: si el esquema cambió, se descarta y se empieza limpio.
    if (typeof guardado?.semanaActual !== 'number' || !guardado?.recursos) return null;
    return guardado;
  } catch {
    return null;
  }
}

export function useJuego() {
  const [estado, setEstado] = useState<GameState>(() => cargarPartidaGuardada() ?? crearEstadoInicial());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const contadorAviso = useRef(0);

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
      setEstado((actual) => {
        const resultado = ejecutarComando(actual, comando);
        if (!resultado.ok && resultado.mensaje) mostrarAviso(resultado.mensaje);
        return resultado.estado;
      });
    },
    [mostrarAviso],
  );

  const reiniciar = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE_PARTIDA);
    } catch {
      /* sin persistencia disponible */
    }
    setEstado(crearEstadoInicial({ semilla: Date.now() % 100_000_000 }));
    setAvisos([]);
  }, []);

  const enJuego = useMemo(
    () => estado.estadoJuego === 'JUGANDO' || estado.estadoJuego === 'DESCANSO_FORZADO_SEM_48',
    [estado.estadoJuego],
  );

  return { estado, despachar, reiniciar, avisos, enJuego };
}

export type JuegoAPI = ReturnType<typeof useJuego>;
