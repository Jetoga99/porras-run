import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { shareLink } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { getMessages, getRace, RACES } from '@/data/mock';
import { formatDistance, formatRaceDate, formatShortDateTime, formatTime } from '@/utils/format';

export function generateStaticParams() {
  return RACES.map((race) => ({ id: race.id }));
}

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
  const race = getRace(id);
  const [listenedIds, setListenedIds] = useState<Set<string>>(
    () =>
      new Set(
        getMessages(id)
          .filter((message) => message.listened)
          .map((message) => message.id),
      ),
  );
  const [copied, setCopied] = useState(false);

  if (!race) {
    return (
      <Screen withHeader>
        <Card>
          <ThemedText type="smallBold">No encontramos esta carrera</ThemedText>
        </Card>
      </Screen>
    );
  }

  const url = shareLink(race.shareSlug);
  const messages = getMessages(race.id);

  async function handleShare() {
    try {
      const result = await shareRaceLink(url, race!.eventName);
      setCopied(result === 'copied');
    } catch {
      // El usuario cerró la hoja de compartir: no es un error.
    }
  }

  function markListened(messageId: string) {
    setListenedIds((current) => new Set(current).add(messageId));
  }

  return (
    <Screen withHeader>
      <Stack.Screen options={{ title: race.eventName }} />

      <Card>
        <ThemedText type="smallBold">{race.eventName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatRaceDate(race.startsAt)}, salida {formatTime(race.startsAt)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {race.city} · {formatDistance(race.distanceKm)}
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="smallBold">Tu link para recibir porras</ThemedText>
        <ThemedText type="code" selectable>
          {url}
        </ThemedText>
        {race.messagesOpen ? (
          <Button label={copied ? 'Link copiado' : 'Compartir link'} onPress={handleShare} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Cerraste la recepción de porras para esta carrera.
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Porras recibidas ({messages.length})</ThemedText>
        {messages.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Todavía no llegan porras. ¡Comparte tu link!
          </ThemedText>
        )}
        {messages.map((message) => {
          const listened = listenedIds.has(message.id);
          return (
            <Card key={message.id}>
              <View style={styles.messageHeader}>
                <ThemedText type="smallBold">{message.senderName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatShortDateTime(message.createdAt)}
                </ThemedText>
              </View>
              <ThemedText>{message.body}</ThemedText>
              {listened ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Escuchada
                </ThemedText>
              ) : (
                <Button
                  label="Marcar como escuchada"
                  variant="secondary"
                  onPress={() => markListened(message.id)}
                />
              )}
            </Card>
          );
        })}
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
});
