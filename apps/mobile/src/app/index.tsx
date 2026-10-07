import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { RACES } from '@/data/mock';

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
  const demoRace = RACES[0];

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
        <Button label="Ver mis carreras" onPress={() => router.push('/carreras')} />
        <Button
          label="Probar el link de un amigo"
          variant="secondary"
          onPress={() => router.push(`/c/${demoRace.shareSlug}`)}
        />
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.center}>
        CÓMO FUNCIONA
      </ThemedText>
      {STEPS.map((step, index) => (
        <Card key={step.title} style={styles.step}>
          <ThemedText type="subtitle" themeColor="accent">
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

      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Versión de demostración con datos de prueba.
      </ThemedText>
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
  stepText: {
    flex: 1,
    gap: Spacing.half,
  },
});
