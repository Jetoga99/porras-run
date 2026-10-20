import Head from 'expo-router/head';

import { LegalDocument, type LegalSection } from '@/components/legal-document';
import { Screen } from '@/components/screen';

const SECTIONS: LegalSection[] = [
  {
    title: 'Responsable de tus datos',
    paragraphs: [
      'PorraRun es un proyecto académico desarrollado por Jesús Torres García, con domicilio en la Ciudad de México, responsable del tratamiento de los datos personales que se recaban a través de la aplicación web y móvil. Para cualquier asunto relacionado con este aviso escribe a privacidad@porrarun.mx.',
    ],
  },
  {
    title: 'Datos personales que recabamos',
    paragraphs: ['Recabamos únicamente los datos necesarios para que la aplicación funcione:'],
    bullets: [
      'Corredores: nombre, correo electrónico, contraseña (que guardamos cifrada con bcrypt, nunca en texto claro) y los datos de sus carreras: nombre del evento, fecha, hora de salida, ciudad y distancia.',
      'Personas que mandan una porra: el nombre o apodo que escriban, el texto del mensaje, la fecha y hora en que aceptan estos términos y un identificador cifrado (hash) de su dirección IP. No guardamos la IP original.',
      'No recabamos datos personales sensibles ni datos de ubicación.',
    ],
  },
  {
    title: 'Para qué usamos tus datos',
    paragraphs: ['Finalidades necesarias para el servicio:'],
    bullets: [
      'Crear y administrar la cuenta del corredor e iniciar su sesión.',
      'Generar el link de cada carrera y mostrar a quien lo abre el primer nombre del corredor y los datos del evento.',
      'Entregar al corredor las porras que recibe y permitirle ocultarlas o reportarlas.',
      'Prevenir abusos, como el envío masivo de mensajes, mediante límites por dispositivo.',
    ],
  },
  {
    title: 'Finalidades secundarias y transferencias',
    paragraphs: [
      'PorraRun no usa tus datos con fines publicitarios ni de mercadotecnia, y no los vende, renta ni transfiere a terceros. Los datos solo se comparten si lo ordena una autoridad competente conforme a la ley.',
    ],
  },
  {
    title: 'Cómo protegemos tus datos',
    bullets: [
      'Toda la comunicación viaja cifrada mediante HTTPS (TLS).',
      'Las contraseñas se almacenan con un hash bcrypt y las IP como hash SHA-256 con sal.',
      'Cada corredor solo puede ver y administrar sus propias carreras y porras.',
      'El servidor aplica encabezados de seguridad (Content-Security-Policy, HSTS, entre otros) y límites de peticiones.',
    ],
  },
  {
    title: 'Conservación',
    paragraphs: [
      'Conservamos los datos mientras la cuenta esté activa. Al eliminar una carrera se eliminan también sus porras; al eliminar la cuenta se eliminan todas sus carreras y mensajes. Puedes eliminar tu cuenta en cualquier momento desde Mis carreras > Eliminar mi cuenta, o en la página /porras/cuenta/eliminar.',
    ],
  },
  {
    title: 'Tus derechos ARCO',
    paragraphs: [
      'Puedes solicitar el Acceso, Rectificación, Cancelación u Oposición al tratamiento de tus datos, así como revocar tu consentimiento, escribiendo a privacidad@porrarun.mx con tu nombre, el correo de tu cuenta (si tienes una) y la descripción de tu solicitud. Te responderemos en un plazo máximo de 20 días hábiles, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
    ],
  },
  {
    title: 'Cambios a este aviso',
    paragraphs: [
      'Cualquier cambio a este Aviso de Privacidad se publicará en esta misma página, indicando la fecha de la última actualización.',
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <Screen withHeader>
      <Head>
        <title>Aviso de Privacidad · PorraRun</title>
        <meta
          name="description"
          content="Qué datos recaba PorraRun, para qué los usa y cómo los protege."
        />
      </Head>
      <LegalDocument
        title="Aviso de Privacidad"
        updatedAt="14 de octubre de 2026"
        intro="En PorraRun cuidamos los datos de los corredores y de quienes les mandan porras. Este aviso explica qué datos recabamos, para qué los usamos y cómo los protegemos."
        sections={SECTIONS}
      />
    </Screen>
  );
}
