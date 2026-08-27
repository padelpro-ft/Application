import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// Server component: fetches clubs directly via Prisma (no client-side fetch
// needed for a public, read-only listing). This is the pattern to follow
// when porting the prototype's ClubsListScreen.
export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({ include: { courts: true }, orderBy: { createdAt: 'desc' } });

  return (
    <main className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-xl font-bold mb-5">Trouver un club</h1>
      <div className="space-y-3">
        {clubs.map((c) => (
          <Link key={c.id} href={`/clubs/${c.id}`} className="block border border-slate-200 rounded-2xl p-4 hover:bg-slate-50">
            <div className="font-bold">{c.name}</div>
            <div className="text-sm text-slate-500">{c.city} · {c.courts.length} terrain(s)</div>
          </Link>
        ))}
        {clubs.length === 0 && <p className="text-slate-400 text-sm">Aucun club pour l'instant.</p>}
      </div>
    </main>
  );
}
