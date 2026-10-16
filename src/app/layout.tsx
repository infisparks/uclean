import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#008f51',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'U CLEAN - Professional Laundry & Dry Cleaning Services | Nerul',
  description:
    'From everyday wear to your most precious outfits — we clean, care and deliver with trust. Top rated laundry, dry cleaning, sofa shampooing & bridal wear care in Nerul Sector 6.',
  keywords: [
    'U CLEAN',
    'Laundry Nerul',
    'Dry Cleaning Nerul',
    'Steam Ironing Nerul',
    'Shoe Spa Navi Mumbai',
    'Curtain Cleaning Nerul',
    'Sofa Shampooing Nerul',
    'VIP Laundry Membership',
  ],
  authors: [{ name: 'U CLEAN Nerul' }],
  openGraph: {
    title: 'U CLEAN - Professional Laundry & Dry Cleaning Services | Nerul',
    description: 'Cleaner Clothes, Brighter You. Everyday laundry to luxury garments with free pickup & express delivery.',
    url: 'https://uclean-nerul.web.app',
    siteName: 'U CLEAN Nerul',
    images: [
      {
        url: 'https://res.cloudinary.com/zzbuyz8r/image/upload/f_auto,q_auto/bg',
        width: 1200,
        height: 630,
        alt: 'U CLEAN Laundry & Dry Cleaning',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[#FAF6EE] text-[#0c2b1e] min-h-screen w-full" suppressHydrationWarning>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '896307513448689');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=896307513448689&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {children}
      </body>
    </html>
  );
}
