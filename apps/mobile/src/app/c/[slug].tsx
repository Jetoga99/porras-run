import { LIMITS, sendMessageSchema } from '@porras/shared';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Checkbox } from '@/components/checkbox';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getRaceBySlug, RACES, RUNNER_NAME } from '@/data/mock';
import { formatDistance, formatRaceDate, formatTime } from '@/utils/format';

/** En el export estático se pre-generan las páginas de las carreras de prueba. */
export function generateStaticParams() {
  return RACES.map((race) => ({ slug: race.shareSlug }));
}

type FieldErrors = Partial<Record<'senderName' | 'body' | 'acceptedTerms', string>>;

export default function SendPorraScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const race = getRaceBySlug(slug);

  const [senderName, setSenderName] = useState('');
  const [body, setBody] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);

  if (!race) {
    return (
      <Screen withHeader>
        <Card>
          <ThemedText type="smallBold">Este link no existe</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Revisa que esté completo o pídele a tu corredor que te lo comparta otra vez.
          </ThemedText>
        </Card>
      </Screen>
    );
  }

  function handleSubmit() {
    const result = sendMessageSchema.safeParse({ senderName, body, acceptedTerms });
    const fieldErrors: FieldErrors = {};
    if (!result.success) {
      for (const [field, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
        fieldErrors[field as keyof FieldErrors] = messages?.[0];
      }
    }
    // En la Fase 1 solo hay texto, así que el mensaje es obligatorio (el audio llega en la Fase 3).
    if (!body.trim()) {
      fieldErrors.body = 'Escribe tu porra';
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length === 0) {
      setSent(true);
    }
  }

  function handleSendAnother() {
    setBody('');
    setSent(false);
  }

  return (
    <Screen withHeader>
      <Head>
        <title>{`Manda una porra a ${RUNNER_NAME} · PorraRun`}</title>
        <meta
          name="description"
          content={`${RUNNER_NAME} corre ${race.eventName}. ¡Mándale ánimo!`}
        />
      </Head>

      <View style={styles.header}>
        <ThemedText type="subtitle">¡Échale porras a {RUNNER_NAME}!</ThemedText>
        <ThemedText themeColor="textSecondary">
          Corre {race.eventName} ({formatDistance(race.distanceKm)}) en {race.city}, el{' '}
          {formatRaceDate(race.startsAt)} a las {formatTime(race.startsAt)}.
        </ThemedText>
      </View>

      {!race.messagesOpen ? (
        <Card>
          <ThemedText type="smallBold">La recepción de porras está cerrada</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {RUNNER_NAME} ya no está recibiendo mensajes para esta carrera.
          </ThemedText>
        </Card>
      ) : sent ? (
        <Card>
          <ThemedText type="smallBold">¡Porra enviada!</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Gracias, {senderName.trim()}. {RUNNER_NAME} la va a escuchar antes de su carrera.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            (Demostración: el mensaje todavía no se guarda en un servidor.)
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
              Acepto los Términos de uso y el Aviso de Privacidad de PorraRun.
            </ThemedText>
          </Checkbox>
          {errors.acceptedTerms && (
            <ThemedText type="small" themeColor="accent">
              {errors.acceptedTerms}
            </ThemedText>
          )}
          <Button label="Enviar porra" onPress={handleSubmit} />
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
