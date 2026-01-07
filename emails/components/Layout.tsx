import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';

interface LayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export function Layout({ children, previewText }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${process.env.APP_URL}/images/logo-dark.png`}
              width="40"
              height="40"
              alt="NextBoard"
              style={logo}
            />
            <Heading style={h1}>NextBoard</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${process.env.APP_URL}/settings/notifications`} style={link}>
                Manage notification preferences
              </Link>
              {' • '}
              <Link href={`${process.env.APP_URL}`} style={link}>
                Open NextBoard
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © 2025 NextBoard. Turn meetings into action.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#0f172a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '20px 0',
};

const logo = {
  borderRadius: '8px',
};

const h1 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '32px',
};

const footer = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '20px',
};

const footerCopyright = {
  color: '#64748b',
  fontSize: '11px',
  marginTop: '8px',
};

const hr = {
  borderColor: '#334155',
  margin: '20px 0',
};

const link = {
  color: '#60a5fa',
  textDecoration: 'none',
};





