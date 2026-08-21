import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ABC Assist',
  description: 'Specialist assistants for ABC Insurance Ltd.',
};

/**
 * `viewport-fit=cover` and a locked scale keep the embedded sheet steady
 * inside the mobile WebView, where a pinch or an auto-zoom on focus would
 * otherwise shift the whole chat.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
