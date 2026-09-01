import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const clubCount = await prisma.club.count();

  return (
    <div>
      <div className="relative bg-slate-950 text-white px-5 pt-14 pb-14 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 34px)' }} />
        <div className="relative max-w-xl mx-auto text-center">
          <p className="text-lime-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Réservation de padel</p>
          <h1 className="text-3xl sm:text-4xl leading-[1.1] font-bold mb-4">Réservez votre terrain, simplement.</h1>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-sm mx-auto">Trouvez un club, choisissez votre créneau et réservez en quelques secondes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
            <Link href="/clubs" className="px-6 py-3 rounded-xl font-semibold text-sm bg-lime-400 text-slate-950 hover:bg-lime-300 transition">Trouver un terrain</Link>
            <Link href="/register" className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition">Je suis un club</Link>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-10 grid grid-cols-3 gap-4 text-center">
        {[['Sport', '🎾'], ['Premium', '⚡'], ['Rapide', '⏱️']].map(([l, e]) => (
          <div key={l}>
            <div className="text-2xl mb-1">{e}</div>
            <div className="text-xs font-semibold text-slate-600">{l}</div>
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto px-5 pb-14">
        <Link href="/clubs" className="block text-center py-2.5 rounded-xl font-semibold text-sm bg-slate-950 text-white hover:bg-slate-800 transition">
          Voir {clubCount > 0 ? `les ${clubCount} clubs disponibles` : 'les clubs disponibles'}
        </Link>
      </div>
    </div>
  );
}
