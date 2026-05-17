import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'Claims Intake Wizard | Papaya Insurance',
  description: 'Submit your insurance claim quickly and easily through our guided multi-step wizard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
