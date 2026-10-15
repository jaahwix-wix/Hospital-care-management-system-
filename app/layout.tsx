import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'HOSCARE – Hospital Care Management System',
  description: 'Enterprise Hospital Management System with patient lifecycle tracking, multi-hospital administration, bed & ward management, and advanced laboratory sample analysis.',
  openGraph: {
    title: 'HOSCARE – Hospital Care Management System',
    description: 'Enterprise Hospital Management System with patient lifecycle tracking, multi-hospital administration, bed & ward management, and advanced laboratory sample analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOSCARE – Hospital Care Management System',
    description: 'Enterprise Hospital Management System with patient lifecycle tracking, multi-hospital administration, bed & ward management, and advanced laboratory sample analysis.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
