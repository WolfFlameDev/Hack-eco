import { Inter } from 'next/font/google';
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EcoCommerce - Sustainable Shopping Made Simple',
  description: 'Discover eco-friendly products from trusted sellers. Join our community committed to sustainable living and conscious consumption.',
  keywords: 'eco-friendly, sustainable, shopping, green products, environment',
  authors: [{ name: 'EcoCommerce Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}