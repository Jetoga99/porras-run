import Head from 'expo-router/head';

import { LegalDocument, type LegalSection } from '@/components/legal-document';
import { Screen } from '@/components/screen';

const SECTIONS: LegalSection[] = [
  {
    title: 'Qué es PorraRun',
    paragraphs: [
      'PorraRun permite que un corredor registre sus carreras y comparta un link para que amigos y familiares le manden mensajes de ánimo ("porras"). Al usar la aplicación aceptas estos Términos y el Aviso de Privacidad.',
    ],
  },
  {
    title: 'Uso permitido',
    bullets: [
      'Mandar mensajes de ánimo respetuosos al corredor que te compartió su link.',
      'Como corredor, compartir tu link solo con las personas que quieras y administrar las porras que recibes.',
      'Mantener la confidencialidad de tu contraseña; eres responsable de la actividad en tu cuenta.',
    ],
  },
  {
    title: 'Contenido prohibido',
    paragraphs: ['No está permitido publicar mensajes que:'],
    bullets: [
      'Contengan insultos, acoso, amenazas o discriminación de cualquier tipo.',
      'Incluyan publicidad, spam o enlaces engañosos.',
      'Revelen datos personales de otras personas sin su consentimiento.',
      'Infrinjan derechos de terceros o la legislación mexicana.',
    ],
  },
  {
    title: 'Moderación',
    paragraphs: [
      'Cada persona es responsable de los mensajes que envía. El corredor puede ocultar o reportar cualquier porra, y PorraRun puede eliminar mensajes o suspender cuentas que incumplan estos Términos. Para evitar abusos, el número de porras que se pueden mandar en un periodo de tiempo es limitado.',
    ],
  },
  {
    title: 'Limitación de responsabilidad',
    bullets: [
      'PorraRun se ofrece "tal cual", como proyecto académico, sin garantía de disponibilidad continua.',
      'No garantizamos que el corredor lea o escuche cada mensaje antes o durante su carrera.',
      'PorraRun no es una aplicación médica ni de seguridad, y no sustituye la asistencia de los organizadores de la carrera ni los servicios de emergencia.',
      'No somos responsables por el contenido que publiquen los usuarios ni por daños derivados del uso de la aplicación, en la medida que lo permita la ley.',
    ],
  },
  {
    title: 'Cambios y legislación aplicable',
    paragraphs: [
      'Podemos actualizar estos Términos; la versión vigente siempre estará en esta página. Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos y, para cualquier controversia, por los tribunales de la Ciudad de México.',
    ],
  },
];

export default function TermsScreen() {
  return (
    <Screen withHeader>
      <Head>
        <title>Términos de uso · PorraRun</title>
        <meta
          name="description"
          content="Uso permitido de PorraRun y limitaciones de responsabilidad."
        />
      </Head>
      <LegalDocument
        title="Términos de uso"
        updatedAt="14 de octubre de 2026"
        intro="Estos Términos explican cómo puedes usar PorraRun y los límites de nuestra responsabilidad."
        sections={SECTIONS}
      />
    </Screen>
  );
}
