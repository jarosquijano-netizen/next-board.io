import { Layout } from '../components/Layout';
import { CardPreview } from '../components/CardPreview';
import { Heading, Text, Section, Button } from '@react-email/components';

interface OverdueAlertProps {
  userName: string;
  card: any;
  daysOverdue: number;
}

export function OverdueAlert({ userName, card, daysOverdue }: OverdueAlertProps) {
  return (
    <Layout previewText={`Overdue: ${card.summary}`}>
      <Section style={alertBox}>
        <Text style={alertIcon}>⚠️</Text>
        <Heading style={h2}>Action Item Overdue</Heading>
      </Section>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        This action item is now <strong style={{ color: '#ef4444' }}>
          {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
        </strong>:
      </Text>

      <CardPreview card={card} />

      <Text style={paragraph}>
        Please update the status or adjust the deadline if needed.
      </Text>

      <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
        <Button
          href={`${process.env.APP_URL}/board/${card.meetingId}?cardId=${card.id}`}
          style={urgentButton}
        >
          View & Update Card
        </Button>
      </Section>
    </Layout>
  );
}

const alertBox = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#7f1d1d',
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

const urgentButton = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};





