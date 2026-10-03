import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rev.ai',
  description: 'AI-powered study partner.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
