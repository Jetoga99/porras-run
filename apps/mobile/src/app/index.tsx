import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

/** Carrera de demostración incluida en db/02-seed.sql. */
const DEMO_SLUG = 'medio-gto-k7f2';

const STEPS = [
  {
    title: 'Registra tu carrera',
    text: 'Evento, fecha, hora de salida y distancia. Te toma menos de un minuto.',
  },
  {
    title: 'Comparte tu link',
    text: 'Mándalo por WhatsApp o redes. Tus amigos lo abren en el navegador, sin instalar nada.',
  },
  {
    title: 'Recibe tus porras',
    text: 'Mensajes de ánimo que escuchas antes de salir y, pronto, mientras corres.',
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useSession();

  return (
    <Screen>
      <Head>
        <title>PorraRun · Porras para corredores</title>
        <meta
          name="description"
          content="Comparte el link de tu carrera y recibe mensajes de ánimo de tus amigos y familia."
        />
      </Head>

      <View style={styles.hero}>
        <ThemedText type="title" themeColor="accent" style={styles.center}>
          PorraRun
        </ThemedText>
        <ThemedText type="subtitle" style={styles.center}>
          Que tu gente corra contigo
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Tus amigos y familia te mandan porras para tu próxima carrera, y tú las escuchas cuando
          más las necesitas.
        </ThemedText>
      </View>

      <View style={styles.actions}>
        {token ? (
          <Button label="Ver mis carreras" onPress={() => router.push('/carreras')} />
        ) : (
          <>
            <Button label="Crear mi cuenta" onPress={() => router.push('/registro')} />
            <Button
              label="Ya tengo cuenta"
              variant="secondary"
              onPress={() => router.push('/login')}
            />
          </>
        )}
        <Button
          label="Probar el link de un amigo"
          variant="secondary"
          onPress={() => router.push(`/c/${DEMO_SLUG}`)}
        />
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.center}>
        CÓMO FUNCIONA
      </ThemedText>
      {STEPS.map((step, index) => (
        <Card key={step.title} style={styles.step}>
          <ThemedText type="subtitle" themeColor="accent" style={styles.stepNumber}>
            {index + 1}
          </ThemedText>
          <View style={styles.stepText}>
            <ThemedText type="smallBold">{step.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {step.text}
            </ThemedText>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.three,
    paddingTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepNumber: {
    width: Spacing.five,
    textAlign: 'center',
  },
  stepText: {
    flex: 1,
    gap: Spacing.half,
  },
});
