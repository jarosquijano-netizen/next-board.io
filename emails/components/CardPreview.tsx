import { Section, Text, Link, Row, Column } from '@react-email/components';

interface CardPreviewProps {
  card: {
    id: string;
    summary: string;
    type: string;
    priority: string;
    owner?: string | null;
    dueDate?: Date | string | null;
    status: string;
  };
}

export function CardPreview({ card }: CardPreviewProps) {
  const typeColors: Record<string, string> = {
    Action: '#3b82f6',
    Decision: '#10b981',
    'Follow-up': '#f59e0b',
    Update: '#8b5cf6',
    Blocker: '#ef4444',
    Risk: '#f97316',
    Question: '#14b8a6',
    Idea: '#ec4899',
  };

  const priorityColors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#3b82f6',
    low: '#6b7280',
  };

  return (
    <Section style={cardContainer}>
      <Row>
        <Column>
          {/* Type & Priority Badges */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{
              ...badge,
              backgroundColor: typeColors[card.type] || '#6b7280',
            }}>
              {card.type}
            </span>
            {' '}
            <span style={{
              ...badge,
              backgroundColor: priorityColors[card.priority] || '#6b7280',
            }}>
              {card.priority.toUpperCase()}
            </span>
          </div>

          {/* Card Title */}
          <Text style={cardTitle}>
            <Link href={`${process.env.APP_URL}/board/${card.id}`} style={cardLink}>
              {card.summary}
            </Link>
          </Text>

          {/* Card Meta */}
          <div style={cardMeta}>
            {card.owner && (
              <Text style={metaText}>👤 {card.owner}</Text>
            )}
            {card.dueDate && (
              <Text style={metaText}>
                📅 {new Date(card.dueDate).toLocaleDateString()}
              </Text>
            )}
            <Text style={metaText}>
              Status: {card.status}
            </Text>
          </div>
        </Column>
      </Row>
    </Section>
  );
}

// Styles
const cardContainer = {
  backgroundColor: '#334155',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  border: '1px solid #475569',
};

const badge = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#fff',
};

const cardTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#fff',
  margin: '0 0 12px 0',
  lineHeight: '24px',
};

const cardLink = {
  color: '#fff',
  textDecoration: 'none',
};

const cardMeta = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap' as const,
};

const metaText = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0',
};





