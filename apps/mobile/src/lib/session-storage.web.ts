/**
 * En la web la sesión vive en localStorage. El riesgo de que un script ajeno la lea (XSS)
 * se mitiga con la Content-Security-Policy estricta que envía Nginx.
 */
const KEY = 'porrarun.session';

export async function loadSession() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveSession(value: string) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Navegación privada sin almacenamiento: la sesión dura lo que la pestaña.
  }
}

export async function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento disponible: no hay nada que borrar.
  }
}
