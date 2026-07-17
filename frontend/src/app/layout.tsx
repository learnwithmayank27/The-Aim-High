import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'The Aim High Academy | IIT-JEE & NEET Foundation | Kanpur',
  description: 'Learn Smart. Aim High. Achieve Success. The Aim High Academy (Managed by Prashant Rajput) provides premium coaching for Class 9th to 12th CBSE/ICSE/ISC boards & IIT-JEE/NEET Foundation. Located in Barra-2, Kanpur.',
  keywords: 'The Aim High Academy, Coaching Kanpur, IIT-JEE Foundation Kanpur, NEET Prep Kanpur, Class 9 to 12 Coaching, Prashant Rajput, Coaching Mandi Barra-2',
  icons: {
    icon: '/favicon-transparent.png',
  },
  openGraph: {
    title: 'The Aim High Academy | IIT-JEE & NEET Foundation | Kanpur',
    description: 'Learn Smart. Aim High. Achieve Success. Premium coaching classes by Prashant Rajput at Coaching Mandi, Kanpur.',
    url: 'https://aimhighkanpur.com',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        width: 800,
        height: 600,
        alt: 'The Aim High Academy',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="font-sans antialiased min-h-full flex flex-col transition-colors duration-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
