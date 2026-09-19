import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from './providers';

export const metadata: Metadata = {
  title: 'Prism HRC Resume Studio',
  description: 'Build a resume that reflects your real potential. Create, improve, and tailor your resume with guidance grounded in your experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
