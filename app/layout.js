import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap'
});

export const metadata = {
  title: 'PAWEŁ SOŁDAŃSKI - Nowoczesne Inwestycje Budowlane',
  description: 'Budujemy przyszłość, tworzymy przestrzeń.',
  icons: {
    icon: [
      { url: '/brand-favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/brand-favicon.svg',
    apple: '/logo.jpg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
