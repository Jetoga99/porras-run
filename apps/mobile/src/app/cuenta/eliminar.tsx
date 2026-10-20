import { deleteAccountSchema } from '@porras/shared';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { FormError } from '@/components/states';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api, ApiRequestError, errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import { fieldErrors } from '@/utils/forms';

/**
 * Eliminación de cuenta. Google Play y la App Store exigen que una app que permite crear
 * cuentas también permita eliminarlas desde la app y desde un enlace web; esta pantalla
 * cumple ambos casos porque la versión web publica la misma ruta (/porras/cuenta/eliminar).
 */
export default function DeleteAccountScreen() {
  const router = useRouter();
  const { ready, token, runner, signOut } = useSession();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    setFormError(undefined);
    const parsed = deleteAccountSchema.safeParse({ password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSending(true);
    try {
      await api<void>('/me', { method: 'DELETE', body: parsed.data, token });
      setDeleted(true);
      await signOut();
    } catch (error) {
      if (error instanceof ApiRequestError) setErrors(error.fields);
      setFormError(errorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen withHeader>
      <Head>
        <title>Eliminar mi cuenta · PorraRun</title>
      </Head>
      <ThemedText type="subtitle">Eliminar mi cuenta</ThemedText>

      {deleted ? (
        <Card>
          <ThemedText type="smallBold">Tu cuenta fue eliminada</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Borramos tu nombre, tu correo, tus carreras y todas las porras que recibiste. Gracias
            por correr con PorraRun.
          </ThemedText>
          <Button label="Volver al inicio" onPress={() => router.replace('/')} />
        </Card>
      ) : (
        <>
          <Card>
            <ThemedText type="smallBold">Qué se elimina</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Tu nombre y correo, todas tus carreras con sus links y todas las porras que recibiste.
              Se borran de inmediato y no se pueden recuperar. No conservamos copias.
            </ThemedText>
          </Card>

          {!ready ? null : token ? (
            <View style={styles.form}>
              <ThemedText>
                Cuenta: <ThemedText type="smallBold">{runner?.email}</ThemedText>
              </ThemedText>
              <TextField
                label="Escribe tu contraseña para confirmar"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
                error={errors.password}
                onSubmitEditing={handleDelete}
              />
              <FormError message={formError} />
              <Button
                label={sending ? 'Eliminando…' : 'Eliminar mi cuenta para siempre'}
                onPress={handleDelete}
                disabled={sending}
              />
              <Button label="Cancelar" variant="secondary" onPress={() => router.back()} />
            </View>
          ) : (
            <View style={styles.form}>
              <ThemedText>
                Entra a tu cuenta y vuelve a esta página para eliminarla. Si ya no puedes entrar,
                escribe desde el correo de tu cuenta a privacidad@porrarun.mx y la eliminaremos en
                un máximo de 20 días hábiles.
              </ThemedText>
              <Button label="Entrar a mi cuenta" onPress={() => router.push('/login')} />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
