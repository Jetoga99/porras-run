import { loginSchema, type AuthResponse } from '@porras/shared';
import { Link, Redirect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { FormError } from '@/components/states';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api, ApiRequestError, errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import { fieldErrors } from '@/utils/forms';

export default function LoginScreen() {
  const router = useRouter();
  const { token, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [sending, setSending] = useState(false);

  if (token) return <Redirect href="/carreras" />;

  async function handleSubmit() {
    setFormError(undefined);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const auth = await api<AuthResponse>('/auth/login', { method: 'POST', body: parsed.data });
      await signIn(auth);
      router.replace('/carreras');
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
        <title>Entrar · PorraRun</title>
      </Head>
      <ThemedText type="subtitle">Entra a tu cuenta</ThemedText>
      <View style={styles.form}>
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          error={errors.password}
          onSubmitEditing={handleSubmit}
        />
        <FormError message={formError} />
        <Button
          label={sending ? 'Entrando…' : 'Entrar'}
          onPress={handleSubmit}
          disabled={sending}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        ¿No tienes cuenta?{' '}
        <Link href="/registro">
          <ThemedText type="smallBold" themeColor="accent">
            Crea una aquí
          </ThemedText>
        </Link>
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
