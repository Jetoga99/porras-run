import * as SecureStore from 'expo-secure-store';

/** En Android e iOS la sesión se guarda cifrada con el almacén seguro del sistema. */
const KEY = 'porrarun.session';

export async function loadSession() {
  return SecureStore.getItemAsync(KEY);
}

export async function saveSession(value: string) {
  await SecureStore.setItemAsync(KEY, value);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY);
}
