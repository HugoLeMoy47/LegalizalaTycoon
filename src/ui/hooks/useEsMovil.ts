import { useEffect, useState } from 'react';

/**
 * Punto de corte entre el tablero de escritorio (tres columnas) y la
 * navegación por pestañas de móvil. Coincide con el `xl:` de Tailwind, que es
 * donde el grid de tres columnas deja de caber.
 */
export const CORTE_MOVIL = '(max-width: 1279px)';

export function useEsMovil(): boolean {
  const [esMovil, setEsMovil] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(CORTE_MOVIL).matches;
  });

  useEffect(() => {
    const consulta = window.matchMedia(CORTE_MOVIL);
    const revisar = () => setEsMovil(consulta.matches);

    consulta.addEventListener('change', revisar);
    // Respaldo por `resize`: al rotar una tableta o al redimensionar desde
    // herramientas de emulación, el evento `change` no siempre llega.
    window.addEventListener('resize', revisar);
    revisar();

    return () => {
      consulta.removeEventListener('change', revisar);
      window.removeEventListener('resize', revisar);
    };
  }, []);

  return esMovil;
}
