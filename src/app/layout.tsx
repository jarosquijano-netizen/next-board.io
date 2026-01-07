import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeScript } from './theme-script';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextBoard - Where meetings become actions',
  description: 'Turn meeting recordings and transcripts into structured, AI-generated action boards powered by Claude AI',
  keywords: ['meeting', 'transcript', 'AI', 'productivity', 'action items', 'Claude', 'Anthropic'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <ThemeScript />
        </head>
        <body className="bg-white dark:bg-slate-950 transition-colors duration-300">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

