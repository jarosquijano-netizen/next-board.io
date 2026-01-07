import { Layout } from '../components/Layout';
import { CardPreview } from '../components/CardPreview';
import { Heading, Text, Section, Button } from '@react-email/components';

interface DailyDigestProps {
  userName: string;
  overdueCards: any[];
  dueTodayCards: any[];
  blockedCards: any[];
  stats: {
    totalActive: number;
    completedYesterday: number;
  };
}

export function DailyDigest({
  userName,
  overdueCards,
  dueTodayCards,
  blockedCards,
  stats,
}: DailyDigestProps) {
  return (
    <Layout previewText={`Your daily focus: ${overdueCards.length} overdue, ${dueTodayCards.length} due today`}>
      <Heading style={h2}>☀️ Good morning, {userName}!</Heading>
      
      <Text style={paragraph}>
        Here's your daily focus for {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}:
      </Text>

      {/* Stats Summary */}
      <Section style={statsContainer}>
        <div style={statBox}>
          <Text style={statNumber}>{stats.totalActive}</Text>
          <Text style={statLabel}>Active Items</Text>
        </div>
        <div style={statBox}>
          <Text style={statNumber}>{stats.completedYesterday}</Text>
          <Text style={statLabel}>Done Yesterday</Text>
        </div>
        <div style={statBox}>
          <Text style={statNumber}>{overdueCards.length + dueTodayCards.length}</Text>
          <Text style={statLabel}>Need Focus</Text>
        </div>
      </Section>

      {/* Overdue Items */}
      {overdueCards.length > 0 && (
        <Section style={section}>
          <Heading style={h3}>🚨 Overdue ({overdueCards.length})</Heading>
          <Text style={sectionDesc}>These need immediate attention</Text>
          {overdueCards.slice(0, 5).map(card => (
            <CardPreview key={card.id} card={card} />
          ))}
          {overdueCards.length > 5 && (
            <Text style={moreText}>
              + {overdueCards.length - 5} more overdue items
            </Text>
          )}
        </Section>
      )}

      {/* Due Today */}
      {dueTodayCards.length > 0 && (
        <Section style={section}>
          <Heading style={h3}>🎯 Due Today ({dueTodayCards.length})</Heading>
          <Text style={sectionDesc}>Complete these before end of day</Text>
          {dueTodayCards.slice(0, 5).map(card => (
            <CardPreview key={card.id} card={card} />
          ))}
          {dueTodayCards.length > 5 && (
            <Text style={moreText}>
              + {dueTodayCards.length - 5} more items due today
            </Text>
          )}
        </Section>
      )}

      {/* Blocked Items */}
      {blockedCards.length > 0 && (
        <Section style={section}>
          <Heading style={h3}>🚧 Blocked ({blockedCards.length})</Heading>
          <Text style={sectionDesc}>These need unblocking</Text>
          {blockedCards.slice(0, 3).map(card => (
            <CardPreview key={card.id} card={card} />
          ))}
        </Section>
      )}

      {/* Empty State */}
      {overdueCards.length === 0 && dueTodayCards.length === 0 && blockedCards.length === 0 && (
        <Section style={emptyState}>
          <Text style={emptyText}>🎉</Text>
          <Heading style={h3}>All Clear!</Heading>
          <Text style={paragraph}>
            No urgent items today. Great work staying on top of things!
          </Text>
        </Section>
      )}

      {/* CTA Button */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <Button
          href={`${process.env.APP_URL}/boards`}
          style={button}
        >
          Open My Boards
        </Button>
      </Section>
    </Layout>
  );
}

// Styles
const h2 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const h3 = {
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const paragraph = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
};

const statsContainer = {
  display: 'flex',
  justifyContent: 'space-around',
  marginBottom: '32px',
  padding: '20px',
  backgroundColor: '#0f172a',
  borderRadius: '8px',
};

const statBox = {
  textAlign: 'center' as const,
};

const statNumber = {
  color: '#60a5fa',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '1',
};

const statLabel = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '8px 0 0 0',
};

const section = {
  marginBottom: '32px',
};

const sectionDesc = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0 0 16px 0',
};

const moreText = {
  color: '#60a5fa',
  fontSize: '13px',
  textAlign: 'center' as const,
  marginTop: '12px',
};

const emptyState = {
  textAlign: 'center' as const,
  padding: '40px 20px',
};

const emptyText = {
  fontSize: '48px',
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





