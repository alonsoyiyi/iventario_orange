import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client'; // Importar UserProvider de Auth0
import { GlobalProvider } from '@/contexts/GlobalContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Orange Inventario',
  description: 'Sistema de gestión de inventario para Orange',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <UserProvider> {/* Envolver con UserProvider de Auth0 */}
          <GlobalProvider>
            {children}
          </GlobalProvider>
        </UserProvider>
      </body>
    </html>
  );
}
