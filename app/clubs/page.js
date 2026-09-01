'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock } from 'lucide-react';
import { Card, Empty, inputCls, PublicHeader } from '@/app/_components/ui';

export default function ClubsPage() {
  const [query, setQuery] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      fetch(`/api/clubs${query ? `?q=${encodeURIComponent(query)}` : ''}`)
        .then((r) => r.json())
        .then((d) => { setClubs(d.clubs || []); setLoading(false); });
    }, 250); // debounce so we don't hit the API on every keystroke
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div>
      <PublicHeader />
      <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-xl font-bold mb-4">Trouver un club</h1>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className={`${inputCls} pl-9`} placeholder="Ville ou nom du club" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading && <p className="text-sm text-slate-400">Recherche...</p>}
      {!loading && clubs.length === 0 && <Empty text="Aucun club ne correspond à votre recherche." />}

      <div className="space-y-3">
        {clubs.map((c) => (
          <Link key={c.id} href={`/clubs/${c.id}`}>
            <Card className="p-4 flex gap-3 hover:bg-slate-50 transition">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-lime-400 font-bold flex items-center justify-center text-sm shrink-0">
                {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-950 text-sm truncate">{c.name}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><MapPin size={12} />{c.city}</div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>{c.courts.length} terrain{c.courts.length > 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{c.openHour}–{c.closeHour}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
