import { LIMITS, registerSchema, type AuthResponse } from '@porras/shared';
import { Link, Redirect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Screen } from '@/components/screen';
import { FormError } from '@/components/states';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api, ApiRequestError, errorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import { fieldErrors } from '@/utils/forms';

export default function RegisterScreen() {
  const router = useRouter();
  const { token, signIn } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [sending, setSending] = useState(false);

  if (token) return <Redirect href="/carreras" />;

  async function handleSubmit() {
    setFormError(undefined);
    const parsed = registerSchema.safeParse({ name, email, password });
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!acceptedTerms) {
      nextErrors.acceptedTerms = 'Debes aceptar los Términos y el Aviso de Privacidad';
    }
    setErrors(nextErrors);
    if (!parsed.success || !acceptedTerms) return;

    setSending(true);
    try {
      const auth = await api<AuthResponse>('/auth/register', { method: 'POST', body: parsed.data });
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
        <title>Crear cuenta · PorraRun</title>
      </Head>
      <ThemedText type="subtitle">Crea tu cuenta de corredor</ThemedText>
      <View style={styles.form}>
        <TextField
          label="Tu nombre"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          maxLength={LIMITS.runnerNameMaxChars}
          error={errors.name}
        />
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
          label={`Contraseña (mínimo ${LIMITS.passwordMinChars} caracteres)`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          maxLength={LIMITS.passwordMaxChars}
          error={errors.password}
        />
        <Checkbox checked={acceptedTerms} onChange={setAcceptedTerms}>
          <ThemedText type="small">
            Acepto los{' '}
            <Link href="/terminos">
              <ThemedText type="smallBold" themeColor="accent">
                Términos de uso
              </ThemedText>
            </Link>{' '}
            y el{' '}
            <Link href="/privacidad">
              <ThemedText type="smallBold" themeColor="accent">
                Aviso de Privacidad
              </ThemedText>
            </Link>
            .
          </ThemedText>
        </Checkbox>
        <FormError message={errors.acceptedTerms} />
        <FormError message={formError} />
        <Button
          label={sending ? 'Creando cuenta…' : 'Crear cuenta'}
          onPress={handleSubmit}
          disabled={sending}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login">
          <ThemedText type="smallBold" themeColor="accent">
            Entra aquí
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
