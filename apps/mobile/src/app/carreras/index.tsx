import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getMessages, RACES, RUNNER_NAME } from '@/data/mock';
import { formatDistance, formatRaceDate } from '@/utils/format';

export default function RacesScreen() {
  return (
    <Screen withHeader>
      <ThemedText type="subtitle">Hola, {RUNNER_NAME}</ThemedText>
      <ThemedText themeColor="textSecondary">
        Toca una carrera para ver tus porras y compartir su link.
      </ThemedText>

      {RACES.map((race) => {
        const messages = getMessages(race.id);
        const pending = messages.filter((message) => !message.listened).length;

        return (
          <Link key={race.id} href={`/carreras/${race.id}`} asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <ThemedText type="smallBold">{race.eventName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatRaceDate(race.startsAt)} · {race.city} · {formatDistance(race.distanceKm)}
                </ThemedText>
                <View style={styles.row}>
                  <ThemedText type="small">
                    {messages.length} {messages.length === 1 ? 'porra' : 'porras'}
                  </ThemedText>
                  {pending > 0 && (
                    <ThemedText type="smallBold" themeColor="accent">
                      {pending} sin escuchar
                    </ThemedText>
                  )}
                  {!race.messagesOpen && (
                    <ThemedText type="small" themeColor="textSecondary">
                      Recepción cerrada
                    </ThemedText>
                  )}
                </View>
              </Card>
            </Pressable>
          </Link>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
