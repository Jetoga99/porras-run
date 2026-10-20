import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ErrorCard, FormError, Loading } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { shareLink } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { errorMessage } from '@/lib/api';
import { useMessageAction, useMessages, useRace, useUpdateRace } from '@/lib/queries';
import { useSession } from '@/lib/session';
import { formatDistance, formatRaceDate, formatShortDateTime, formatTime } from '@/utils/format';

/** Hoja nativa de compartir en el teléfono; en la web, la del navegador o el portapapeles. */
async function shareRaceLink(url: string, eventName: string): Promise<'shared' | 'copied'> {
  const text = `Voy a correr ${eventName}. ¡Mándame una porra! ${url}`;
  if (Platform.OS !== 'web') {
    await Share.share({ message: text });
    return 'shared';
  }
  if (navigator.share) {
    await navigator.share({ title: 'PorraRun', text, url });
    return 'shared';
  }
  await navigator.clipboard.writeText(url);
  return 'copied';
}

export default function RaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, token } = useSession();
  const race = useRace(id);
  const messages = useMessages(id);
  const updateRace = useUpdateRace(id);
  const messageAction = useMessageAction(id);
  const [copied, setCopied] = useState(false);

  if (ready && !token) return <Redirect href="/login" />;

  if (!ready || race.isPending) {
    return (
      <Screen withHeader>
        <Loading />
      </Screen>
    );
  }

  if (race.isError) {
    return (
      <Screen withHeader>
        <ErrorCard message={errorMessage(race.error)} />
      </Screen>
    );
  }

  const data = race.data;
  const url = shareLink(data.shareSlug);

  async function handleShare() {
    try {
      const result = await shareRaceLink(url, data.eventName);
      setCopied(result === 'copied');
    } catch {
      // El usuario cerró la hoja de compartir: no es un error.
    }
  }

  return (
    <Screen withHeader>
      <Stack.Screen options={{ title: data.eventName }} />
      <Head>
        <title>{`${data.eventName} · PorraRun`}</title>
      </Head>

      <Card>
        <ThemedText type="smallBold">{data.eventName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatRaceDate(data.startsAt)}, salida {formatTime(data.startsAt)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {[data.city, data.distanceKm ? formatDistance(data.distanceKm) : null]
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="smallBold">Tu link para recibir porras</ThemedText>
        <ThemedText type="code" selectable>
          {url}
        </ThemedText>
        {data.messagesOpen ? (
          <>
            <Button label={copied ? 'Link copiado' : 'Compartir link'} onPress={handleShare} />
            <Button
              label="Cerrar la recepción de porras"
              variant="secondary"
              disabled={updateRace.isPending}
              onPress={() => updateRace.mutate({ messagesOpen: false })}
            />
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              Cerraste la recepción de porras para esta carrera.
            </ThemedText>
            <Button
              label="Volver a abrir la recepción"
              variant="secondary"
              disabled={updateRace.isPending}
              onPress={() => updateRace.mutate({ messagesOpen: true })}
            />
          </>
        )}
        <FormError message={updateRace.isError ? errorMessage(updateRace.error) : undefined} />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Porras recibidas ({data.messageCount})</ThemedText>
        {messages.isPending ? (
          <Loading label="Cargando porras…" />
        ) : messages.isError ? (
          <ErrorCard message={errorMessage(messages.error)} onRetry={() => messages.refetch()} />
        ) : messages.data.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Todavía no llegan porras. ¡Comparte tu link!
          </ThemedText>
        ) : (
          messages.data.map((message) => (
            <Card key={message.id}>
              <View style={styles.messageHeader}>
                <ThemedText type="smallBold">{message.senderName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatShortDateTime(message.createdAt)}
                </ThemedText>
              </View>
              <ThemedText>{message.body}</ThemedText>
              {message.status === 'reported' && (
                <ThemedText type="small" themeColor="accent">
                  Reportada para revisión
                </ThemedText>
              )}
              <View style={styles.actions}>
                {message.listened ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Escuchada
                  </ThemedText>
                ) : (
                  <Button
                    label="Marcar como escuchada"
                    variant="secondary"
                    onPress={() =>
                      messageAction.mutate({ id: message.id, action: { listened: true } })
                    }
                  />
                )}
                <Button
                  label="Ocultar"
                  variant="secondary"
                  onPress={() => messageAction.mutate({ id: message.id, action: { hidden: true } })}
                />
                {message.status !== 'reported' && (
                  <Button
                    label="Reportar"
                    variant="secondary"
                    onPress={() => messageAction.mutate({ id: message.id, action: 'report' })}
                  />
                )}
              </View>
            </Card>
          ))
        )}
        <FormError
          message={messageAction.isError ? errorMessage(messageAction.error) : undefined}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
