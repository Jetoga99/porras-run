/**
 * Config plugin: firma de publicación (upload key) para el AAB de Google Play.
 *
 * La carpeta android/ se regenera con `expo prebuild`, así que la firma no se edita a mano:
 * este plugin la inserta en android/app/build.gradle cada vez.
 *
 * Los datos de la llave NUNCA se versionan. Gradle los lee de:
 *   - %USERPROFILE%\.gradle\gradle.properties en tu PC, o
 *   - variables ORG_GRADLE_PROJECT_PORRAS_UPLOAD_* en GitHub Actions.
 * Si no existen, el build de release se firma con la llave de depuración (solo para pruebas).
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_SIGNING = `
        release {
            // Upload key de PorraRun (ver INSTALL.md, sección Android).
            if (project.hasProperty('PORRAS_UPLOAD_STORE_FILE')) {
                storeFile file(PORRAS_UPLOAD_STORE_FILE)
                storePassword PORRAS_UPLOAD_STORE_PASSWORD
                keyAlias PORRAS_UPLOAD_KEY_ALIAS
                keyPassword PORRAS_UPLOAD_KEY_PASSWORD
            }
        }`;

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes('PORRAS_UPLOAD_STORE_FILE')) return cfg;

    // 1. Agrega signingConfigs.release después del bloque debug.
    const debugBlock = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/;
    if (!debugBlock.test(gradle)) {
      throw new Error('with-android-release-signing: no se encontró signingConfigs.debug');
    }
    gradle = gradle.replace(debugBlock, `$1${RELEASE_SIGNING}`);

    // 2. El buildType release usa esa firma cuando la llave está configurada.
    const releaseUsesDebug =
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
    if (!releaseUsesDebug.test(gradle)) {
      throw new Error(
        'with-android-release-signing: no se encontró la firma del buildType release',
      );
    }
    gradle = gradle.replace(
      releaseUsesDebug,
      "$1signingConfig project.hasProperty('PORRAS_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug",
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });
}

module.exports = withAndroidReleaseSigning;
