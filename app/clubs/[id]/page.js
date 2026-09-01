import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Card, Badge, COURT_STATUS_LABEL, PublicHeader } from '@/app/_components/ui';

export const dynamic = 'force-dynamic';

export default async function ClubDetailPage({ params }) {
  const club = await prisma.club.findUnique({ where: { id: params.id }, include: { courts: true } });
  if (!club) return notFound();

  const availableCourts = club.courts.filter((c) => c.status === 'DISPONIBLE');

  return (
    <div>
      <PublicHeader />
      <div className="max-w-2xl mx-auto pb-10">
      <div className="bg-slate-950 text-white px-5 pt-6 pb-8 sm:rounded-2xl sm:mt-5">
        <Link href="/clubs" className="text-slate-400 text-xs mb-4 inline-block">← Clubs</Link>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-lime-400 text-slate-950 font-bold flex items-center justify-center text-lg shrink-0">
            {club.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{club.name}</h1>
            <div className="flex items-center gap-1 text-slate-300 text-xs mt-1"><MapPin size={12} />{club.address}, {club.city}</div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4">
        <Card className="p-4 grid grid-cols-2 gap-3 text-xs">
          <div><div className="text-slate-400 mb-0.5">Horaires</div><div className="font-semibold text-slate-900 flex items-center gap-1"><Clock size={12} />{club.openHour} – {club.closeHour}</div></div>
          <div><div className="text-slate-400 mb-0.5">Terrains</div><div className="font-semibold text-slate-900">{availableCourts.length} disponible{availableCourts.length > 1 ? 's' : ''} / {club.courts.length}</div></div>
        </Card>
      </div>

      {club.description && <p className="px-5 mt-5 text-sm text-slate-600 leading-relaxed">{club.description}</p>}

      <div className="px-5 mt-5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contacter le club</div>
        <div className="flex flex-wrap gap-2">
          {club.phone && <a href={`tel:${club.phone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-700"><Phone size={13} />Appeler</a>}
          {club.email && <a href={`mailto:${club.email}`} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-700"><Mail size={13} />E-mail</a>}
          {club.whatsapp && <a href={`https://wa.me/${club.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700"><MessageCircle size={13} />WhatsApp</a>}
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Terrains</div>
        <div className="space-y-2">
          {club.courts.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5">
              <div className="text-sm font-semibold text-slate-800">{c.name} <span className="text-slate-400 font-normal">· {c.type}</span></div>
              <Badge>{COURT_STATUS_LABEL[c.status]}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6">
        <Link href={availableCourts.length ? `/clubs/${club.id}/book` : '#'}
          className={`block text-center py-2.5 rounded-xl font-semibold text-sm ${availableCourts.length ? 'bg-lime-400 text-slate-950' : 'bg-slate-100 text-slate-400 pointer-events-none'}`}>
          {availableCourts.length === 0 ? 'Aucun terrain disponible' : `Réserver — dès ${club.pricePerHour}€/h`}
        </Link>
      </div>
      </div>
    </div>
  );
}
