import { Link, Redirect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ErrorCard, Loading } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { errorMessage } from '@/lib/api';
import { useRaces } from '@/lib/queries';
import { useSession } from '@/lib/session';
import { formatDistance, formatRaceDate } from '@/utils/format';

export default function RacesScreen() {
  const router = useRouter();
  const { ready, token, runner, signOut } = useSession();
  const races = useRaces();

  if (ready && !token) return <Redirect href="/login" />;

  return (
    <Screen withHeader>
      <Head>
        <title>Mis carreras · PorraRun</title>
      </Head>
      <ThemedText type="subtitle">Hola{runner ? `, ${runner.name.split(' ')[0]}` : ''}</ThemedText>
      <ThemedText themeColor="textSecondary">
        Toca una carrera para ver tus porras y compartir su link.
      </ThemedText>
      <Button label="Registrar una carrera" onPress={() => router.push('/carreras/nueva')} />

      {!ready || races.isPending ? (
        <Loading label="Cargando tus carreras…" />
      ) : races.isError ? (
        <ErrorCard message={errorMessage(races.error)} onRetry={() => races.refetch()} />
      ) : races.data.length === 0 ? (
        <Card>
          <ThemedText type="smallBold">Todavía no tienes carreras</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Registra tu próxima carrera para obtener tu link de porras.
          </ThemedText>
        </Card>
      ) : (
        races.data.map((race) => (
          <Link key={race.id} href={`/carreras/${race.id}`} asChild>
            <Pressable accessibilityRole="link">
              <Card>
                <ThemedText type="smallBold">{race.eventName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {[
                    formatRaceDate(race.startsAt),
                    race.city,
                    race.distanceKm ? formatDistance(race.distanceKm) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </ThemedText>
                <View style={styles.row}>
                  <ThemedText type="small">
                    {race.messageCount} {race.messageCount === 1 ? 'porra' : 'porras'}
                  </ThemedText>
                  {race.pendingCount > 0 && (
                    <ThemedText type="smallBold" themeColor="accent">
                      {race.pendingCount} sin escuchar
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
        ))
      )}

      {token && <Button label="Cerrar sesión" variant="secondary" onPress={signOut} />}
      {token && (
        <Link href="/cuenta/eliminar" style={styles.deleteLink}>
          <ThemedText type="small" themeColor="textSecondary">
            Eliminar mi cuenta
          </ThemedText>
        </Link>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deleteLink: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
