import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Schedule Pickup & Order | UClean Nerul',
  description: 'Book your laundry, dry cleaning, and home care pickup in Nerul.',
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} ${poppins.className} font-light`}>
      <style>{`
        .order-page-root,
        .order-page-root * {
          font-family: var(--font-poppins), 'Poppins', sans-serif !important;
        }
      `}</style>
      <div className="order-page-root font-light">
        {children}
      </div>
    </div>
  );
}
