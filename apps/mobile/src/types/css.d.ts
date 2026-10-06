// Permite importar hojas de estilo globales (solo web) sin depender de expo-env.d.ts,
// que Expo genera al arrancar y no se versiona. Así `tsc` pasa también en CI.
declare module '*.css';
