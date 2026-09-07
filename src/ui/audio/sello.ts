/**
 * Sonido de sello de madera (*thump*) para la transición de semana
 * (GUIA v2.0 sección 4.A).
 *
 * Sintetizado con Web Audio, sin archivo de audio: ~150 ms de golpe seco
 * (seno grave con caída rápida) + un chasquido de ruido filtrado que da la
 * textura de la madera contra el papel.
 *
 * El AudioContext se crea en el primer gesto del usuario (el clic en
 * "Avanzar Semana"), que es lo que exige la política de autoplay.
 */

const CLAVE_SILENCIO = 'iniciativa-ciudadana:silencio';

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Constructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return null;

  if (!contexto) {
    try {
      contexto = new Constructor();
    } catch {
      return null;
    }
  }
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}

export function estaSilenciado(): boolean {
  try {
    return localStorage.getItem(CLAVE_SILENCIO) === 'true';
  } catch {
    return false;
  }
}

export function alternarSilencio(): boolean {
  const nuevo = !estaSilenciado();
  try {
    localStorage.setItem(CLAVE_SILENCIO, String(nuevo));
  } catch {
    /* sin persistencia disponible */
  }
  return nuevo;
}

/** Golpe de sello burocrático. No hace nada si el jugador silenció el juego. */
export function sonarSello(): void {
  if (estaSilenciado()) return;
  const ctx = obtenerContexto();
  if (!ctx) return;

  const ahora = ctx.currentTime;
  const salida = ctx.createGain();
  salida.gain.value = 0.35;
  salida.connect(ctx.destination);

  // --- Golpe grave: el peso del sello contra el escritorio ---
  const golpe = ctx.createOscillator();
  golpe.type = 'sine';
  golpe.frequency.setValueAtTime(160, ahora);
  golpe.frequency.exponentialRampToValueAtTime(45, ahora + 0.12);

  const envolvente = ctx.createGain();
  envolvente.gain.setValueAtTime(0.0001, ahora);
  envolvente.gain.exponentialRampToValueAtTime(1, ahora + 0.006);
  envolvente.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.15);

  golpe.connect(envolvente).connect(salida);
  golpe.start(ahora);
  golpe.stop(ahora + 0.16);

  // --- Chasquido: madera y papel ---
  const muestras = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i += 1) {
    datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras) ** 3;
  }

  const ruido = ctx.createBufferSource();
  ruido.buffer = buffer;

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.value = 1800;
  filtro.Q.value = 0.8;

  const gananciaRuido = ctx.createGain();
  gananciaRuido.gain.value = 0.28;

  ruido.connect(filtro).connect(gananciaRuido).connect(salida);
  ruido.start(ahora);
  ruido.stop(ahora + 0.05);
}
