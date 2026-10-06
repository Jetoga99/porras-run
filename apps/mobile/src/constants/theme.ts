/**
 * Tokens de diseño de PorraRun: colores (claro y oscuro), tipografía y espacios.
 * Todas las pantallas toman sus valores de aquí para que el estilo sea consistente.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#5C5F66',
    background: '#FFFFFF',
    backgroundElement: '#F4F2F0',
    backgroundSelected: '#E8E4E0',
    /** Color de marca: naranja de "porra". Contraste 5.8:1 con texto blanco (WCAG AA). */
    accent: '#D84315',
    onAccent: '#FFFFFF',
  },
  dark: {
    text: '#F5F5F5',
    textSecondary: '#B0B4BA',
    background: '#121212',
    backgroundElement: '#1F1F21',
    backgroundSelected: '#2E2F33',
    accent: '#FF8A65',
    onAccent: '#1A1A1A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
