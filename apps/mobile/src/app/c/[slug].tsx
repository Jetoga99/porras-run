import { LIMITS, sendMessageSchema } from '@porras/shared';
import { Link, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Checkbox } from '@/components/checkbox';
import { Screen } from '@/components/screen';
import { ErrorCard, FormError, Loading } from '@/components/states';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ApiRequestError, errorMessage } from '@/lib/api';
import { usePublicRace, useSendMessage } from '@/lib/queries';
import { formatDistance, formatRaceDate, formatTime } from '@/utils/format';
import { fieldErrors } from '@/utils/forms';

export default function SendPorraScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const race = usePublicRace(slug);
  const sendMessage = useSendMessage(slug);

  const [senderName, setSenderName] = useState('');
  const [body, setBody] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  if (race.isPending) {
    return (
      <Screen withHeader>
        <Loading />
      </Screen>
    );
  }

  if (race.isError) {
    const notFound = race.error instanceof ApiRequestError && race.error.status === 404;
    return (
      <Screen withHeader>
        {notFound ? (
          <Card>
            <ThemedText type="smallBold">Este link no existe</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Revisa que esté completo o pídele a tu corredor que te lo comparta otra vez.
            </ThemedText>
          </Card>
        ) : (
          <ErrorCard message={errorMessage(race.error)} onRetry={() => race.refetch()} />
        )}
      </Screen>
    );
  }

  const data = race.data;

  function handleSubmit() {
    const parsed = sendMessageSchema.safeParse({ senderName, body, acceptedTerms });
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    // Mientras no exista el audio (Fase 3), el texto es obligatorio.
    if (!body.trim()) nextErrors.body = 'Escribe tu porra';
    setErrors(nextErrors);
    if (!parsed.success || Object.keys(nextErrors).length > 0) return;

    sendMessage.mutate(parsed.data, {
      onSuccess: () => setSent(true),
      onError: (error) => {
        if (error instanceof ApiRequestError) setErrors(error.fields);
        if (error instanceof ApiRequestError && error.status === 409) void race.refetch();
      },
    });
  }

  function handleSendAnother() {
    setBody('');
    setSent(false);
  }

  return (
    <Screen withHeader>
      <Head>
        <title>{`Manda una porra a ${data.runnerName} · PorraRun`}</title>
        <meta
          name="description"
          content={`${data.runnerName} corre ${data.eventName}. ¡Mándale ánimo!`}
        />
      </Head>

      <View style={styles.header}>
        <ThemedText type="subtitle">¡Échale porras a {data.runnerName}!</ThemedText>
        <ThemedText themeColor="textSecondary">
          Corre {data.eventName}
          {data.distanceKm ? ` (${formatDistance(data.distanceKm)})` : ''}
          {data.city ? ` en ${data.city}` : ''}, el {formatRaceDate(data.startsAt)} a las{' '}
          {formatTime(data.startsAt)}.
        </ThemedText>
      </View>

      {!data.messagesOpen ? (
        <Card>
          <ThemedText type="smallBold">La recepción de porras está cerrada</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {data.runnerName} ya no está recibiendo mensajes para esta carrera.
          </ThemedText>
        </Card>
      ) : sent ? (
        <Card>
          <ThemedText type="smallBold">¡Porra enviada!</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Gracias, {senderName.trim()}. {data.runnerName} la va a escuchar antes de su carrera.
          </ThemedText>
          <Button label="Mandar otra porra" variant="secondary" onPress={handleSendAnother} />
        </Card>
      ) : (
        <View style={styles.form}>
          <TextField
            label="Tu nombre"
            placeholder="Ej. Tu tía Lupe"
            value={senderName}
            onChangeText={setSenderName}
            maxLength={LIMITS.senderNameMaxChars}
            autoComplete="name"
            error={errors.senderName}
          />
          <TextField
            label="Tu porra"
            placeholder="Escribe algo que le dé energía en el kilómetro más difícil"
            value={body}
            onChangeText={setBody}
            maxLength={LIMITS.messageMaxChars}
            multiline
            showCounter
            error={errors.body}
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
              </Link>{' '}
              de PorraRun.
            </ThemedText>
          </Checkbox>
          <FormError message={errors.acceptedTerms} />
          <FormError message={sendMessage.isError ? errorMessage(sendMessage.error) : undefined} />
          <Button
            label={sendMessage.isPending ? 'Enviando…' : 'Enviar porra'}
            onPress={handleSubmit}
            disabled={sendMessage.isPending}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
});
