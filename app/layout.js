import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'PadelGo — Réservez votre terrain de padel',
  description: 'Réservation de terrains de padel en quelques secondes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
