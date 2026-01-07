import { Layout } from '../components/Layout';
import { CardPreview } from '../components/CardPreview';
import { Heading, Text, Section, Button } from '@react-email/components';

interface DueTodayAlertProps {
  userName: string;
  card: any;
}

export function DueTodayAlert({ userName, card }: DueTodayAlertProps) {
  return (
    <Layout previewText={`Due Today: ${card.summary}`}>
      <Section style={alertBox}>
        <Text style={alertIcon}>🎯</Text>
        <Heading style={h2}>Due Today</Heading>
      </Section>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        This action item is <strong style={{ color: '#3b82f6' }}>due today</strong>:
      </Text>

      <CardPreview card={card} />

      <Text style={paragraph}>
        Make sure to complete or update this before the end of the day.
      </Text>

      <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
        <Button
          href={`${process.env.APP_URL}/board/${card.meetingId}?cardId=${card.id}`}
          style={button}
        >
          View Card
        </Button>
      </Section>
    </Layout>
  );
}

const alertBox = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#1e3a8a',
  borderRadius: '8px',
  marginBottom: '24px',
};

const alertIcon = {
  fontSize: '48px',
  margin: '0',
};

const h2 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '12px 0 0 0',
};

const paragraph = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};





