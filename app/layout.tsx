import type { Metadata, Viewport } from 'next';
import { Anton, Barlow_Condensed, DM_Mono, DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--f-anton', display: 'swap' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--f-barlow', display: 'swap' });
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono', display: 'swap' });
const sans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--f-sans', display: 'swap' });
const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], style: ['italic'], variable: '--f-serif', display: 'swap' });

export const metadata: Metadata = {
  title: 'REVEL® Red Berry — A Little Louder',
  description: 'A vintage editorial, scroll-driven product story for REVEL Red Berry sparkling drink.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EEE9DC',
};

/*
 * Pre-hide only the opening headline lines so the load entrance doesn't flash.
 * Failsafe: if the engine hasn't started within 3s (script error, slow device),
 * the class is removed and everything shows. Without JS nothing is hidden.
 */
const boot = `document.documentElement.classList.add('js');setTimeout(function(){var d=document.documentElement;if(!d.classList.contains('engine-ready'))d.classList.remove('js')},3000);`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${barlow.variable} ${mono.variable} ${sans.variable} ${serif.variable}`} data-theme="paper" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preload" as="image" href="/revel-can.webp" type="image/webp" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
