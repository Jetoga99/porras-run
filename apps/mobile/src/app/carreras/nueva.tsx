import { createRaceSchema, LIMITS } from '@porras/shared';
import { Redirect, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { FormError } from '@/components/states';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ApiRequestError, errorMessage } from '@/lib/api';
import { useCreateRace } from '@/lib/queries';
import { useSession } from '@/lib/session';
import { fieldErrors } from '@/utils/forms';

// México centro no usa horario de verano desde 2022: la salida siempre es UTC−6.
const MEXICO_CITY_OFFSET = '-06:00';
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function NewRaceScreen() {
  const router = useRouter();
  const { ready, token } = useSession();
  const createRace = useCreateRace();
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('07:00');
  const [city, setCity] = useState('');
  const [distance, setDistance] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (ready && !token) return <Redirect href="/login" />;

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!DATE.test(date)) nextErrors.date = 'Usa el formato AAAA-MM-DD, por ejemplo 2026-11-15';
    if (!TIME.test(time)) nextErrors.time = 'Usa el formato HH:MM de 24 horas, por ejemplo 07:00';
    const distanceKm = distance.trim() ? Number(distance.replace(',', '.')) : undefined;

    const parsed = createRaceSchema.safeParse({
      eventName,
      startsAt: `${date}T${time}:00${MEXICO_CITY_OFFSET}`,
      city: city.trim() || undefined,
      distanceKm,
    });
    if (!parsed.success) Object.assign(nextErrors, fieldErrors(parsed.error), nextErrors);
    setErrors(nextErrors);
    if (!parsed.success || Object.keys(nextErrors).length > 0) return;

    createRace.mutate(parsed.data, {
      onSuccess: (race) => router.replace(`/carreras/${race.id}`),
      onError: (error) => {
        if (error instanceof ApiRequestError) setErrors(error.fields);
      },
    });
  }

  return (
    <Screen withHeader>
      <Head>
        <title>Nueva carrera · PorraRun</title>
      </Head>
      <ThemedText type="subtitle">Registra tu carrera</ThemedText>
      <View style={styles.form}>
        <TextField
          label="Nombre del evento"
          placeholder="Ej. Medio Maratón de Guanajuato"
          value={eventName}
          onChangeText={setEventName}
          maxLength={LIMITS.eventNameMaxChars}
          error={errors.eventName}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Fecha (AAAA-MM-DD)"
              placeholder="2026-11-15"
              value={date}
              onChangeText={setDate}
              maxLength={10}
              error={errors.date}
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="Hora de salida"
              placeholder="07:00"
              value={time}
              onChangeText={setTime}
              maxLength={5}
              error={errors.time ?? errors.startsAt}
            />
          </View>
        </View>
        <TextField
          label="Ciudad"
          placeholder="Ej. Guanajuato"
          value={city}
          onChangeText={setCity}
          maxLength={LIMITS.cityMaxChars}
          error={errors.city}
        />
        <TextField
          label="Distancia (km)"
          placeholder="21.1"
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
          error={errors.distanceKm}
        />
        <FormError message={createRace.isError ? errorMessage(createRace.error) : undefined} />
        <Button
          label={createRace.isPending ? 'Guardando…' : 'Guardar carrera'}
          onPress={handleSubmit}
          disabled={createRace.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  half: {
    flexGrow: 1,
    flexBasis: 160,
  },
});
