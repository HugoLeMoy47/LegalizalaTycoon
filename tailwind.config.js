/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta War Room (GDD 11): azul marino oscuro, gris pizarra,
        // beige de papel oficial y acentos en verde olivo institucional.
        pizarra: {
          900: '#0b1220',
          800: '#111a2b',
          700: '#18243a',
          600: '#22314c',
          500: '#2e4062',
        },
        papel: {
          100: '#f4ecd8',
          200: '#e8dcc0',
          300: '#d8c9a3',
          400: '#bfae86',
        },
        olivo: {
          400: '#8fa04a',
          500: '#6f8034',
          600: '#556327',
        },
        // Bancadas satiricas (GDD 6)
        guinda: '#8c1b3f',
        azulpan: '#1f4fa3',
        tricolor: '#1f7a4d',
        verdepvem: '#3f9c35',
        // Semaforo parlamentario
        favor: '#2fbf71',
        indeciso: '#e0b03b',
        opositor: '#d1495b',
        alerta: '#e07a3b',
      },
      fontFamily: {
        oficial: ['"Special Elite"', '"Courier New"', 'Courier', 'monospace'],
        tactica: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        cuerpo: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        sello: {
          '0%': { transform: 'scale(2.6) rotate(-18deg)', opacity: '0' },
          '60%': { transform: 'scale(0.94) rotate(-8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' },
        },
        pulsoRojo: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(209,73,91,0.55)' },
          '50%': { boxShadow: '0 0 0 10px rgba(209,73,91,0)' },
        },
        derivaIntrusiva: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '15%, 75%': { opacity: '0.85', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-14px)' },
        },
      },
      animation: {
        sello: 'sello 420ms cubic-bezier(.2,.9,.3,1.2) both',
        'pulso-rojo': 'pulsoRojo 1.8s ease-out infinite',
        intrusiva: 'derivaIntrusiva 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
