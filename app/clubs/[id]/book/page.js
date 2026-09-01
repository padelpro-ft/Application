'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Btn, ErrorText, DateStrip, DURATIONS, toMin, toTime, overlaps, genSlots, todayISO, fullDateLabel } from '@/app/_components/ui';

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [club, setClub] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState(60);
  const [sel, setSel] = useState(null);
  const [taken, setTaken] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?callbackUrl=/clubs/${id}/book`);
  }, [status, router, id]);

  useEffect(() => {
    fetch(`/api/clubs/${id}`).then((r) => r.json()).then((d) => { setClub(d.club); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!club) return;
    fetch(`/api/clubs/${id}/availability?date=${date}`).then((r) => r.json()).then((d) => setTaken(d.reservations || []));
    setSel(null);
  }, [date, club, id]);

  if (loading || status === 'loading') return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>;
  if (!club) return <p className="text-center py-20 text-slate-400">Club introuvable.</p>;

  const availableCourts = club.courts.filter((c) => c.status === 'DISPONIBLE');
  const slots = genSlots(club.openHour, club.closeHour, 30);
  const isFree = (courtId, start) => {
    const end = toTime(toMin(start) + duration);
    if (toMin(end) > toMin(club.closeHour)) return false;
    return !taken.some((r) => r.courtId === courtId && overlaps(start, end, r.startTime, r.endTime));
  };
  const price = Math.round((club.pricePerHour * duration) / 60);

  const confirm = async () => {
    setSaving(true); setError('');
    const res = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: club.id, courtId: sel.courtId, date, startTime: sel.start, duration }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error);
      fetch(`/api/clubs/${id}/availability?date=${date}`).then((r) => r.json()).then((d) => setTaken(d.reservations || []));
      setSel(null);
      return;
    }
    setConfirmed(data.reservation);
  };

  if (confirmed) {
    return (
      <div className="max-w-sm mx-auto px-5 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5"><CheckCircle2 size={30} /></div>
        <h2 className="text-xl font-bold text-slate-950 mb-2">Réservation confirmée !</h2>
        <p className="text-sm text-slate-500 mb-6">Le paiement sera effectué directement auprès du club.</p>
        <Card className="p-4 text-left text-sm space-y-1 mb-6">
          <div className="flex justify-between"><span className="text-slate-400">Club</span><span className="font-semibold">{club.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-semibold">{fullDateLabel(date)}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Horaire</span><span className="font-semibold">{confirmed.startTime}–{confirmed.endTime}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Prix</span><span className="font-semibold">{confirmed.price} €</span></div>
        </Card>
        <Link href="/client/reservations" className="block text-center py-2.5 rounded-xl font-semibold text-sm bg-lime-400 text-slate-950">Voir mes réservations</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-5 pb-20">
      <Link href={`/clubs/${id}`} className="text-slate-400 text-xs mb-3 inline-block">← {club.name}</Link>
      <h2 className="text-lg font-bold text-slate-950 mb-4">Choisissez un créneau</h2>

      <DateStrip date={date} onChange={setDate} />

      <div className="flex gap-2 mt-4 mb-4">
        {DURATIONS.map((d) => (
          <button key={d} onClick={() => { setDuration(d); setSel(null); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${duration === d ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-600 border-slate-200'}`}>{d} min</button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-[560px] border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: `64px repeat(${availableCourts.length}, 1fr)` }}>
            <div className="bg-slate-950" />
            {availableCourts.map((c) => <div key={c.id} className="bg-slate-950 text-white text-[11px] font-bold text-center py-2 border-l border-slate-800">{c.name}</div>)}
            {slots.map((s) => (
              <>
                <div key={s + 'lbl'} className="text-[10px] text-slate-400 font-semibold text-center py-2 border-t border-slate-100">{s}</div>
                {availableCourts.map((c) => {
                  const free = isFree(c.id, s);
                  const active = sel && sel.courtId === c.id && sel.start === s;
                  return (
                    <button key={c.id + s} disabled={!free} onClick={() => setSel({ courtId: c.id, courtName: c.name, start: s })}
                      className={`border-t border-l border-slate-100 h-9 text-[10px] font-semibold transition ${active ? 'bg-lime-400' : free ? 'bg-emerald-50 hover:bg-lime-100 text-emerald-700' : 'bg-slate-50 text-slate-300'}`}>
                      {active ? '✓' : free ? '' : '·'}
                    </button>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">Cases vertes = libre · touchez une case pour sélectionner.</p>

      {sel && (
        <Card className="p-4 mt-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Résumé</div>
          <div className="text-sm text-slate-700 space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-semibold">{fullDateLabel(date)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Horaire</span><span className="font-semibold">{sel.start} – {toTime(toMin(sel.start) + duration)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Terrain</span><span className="font-semibold">{sel.courtName}</span></div>
            <div className="flex justify-between text-base pt-1"><span className="text-slate-400">Prix</span><span className="font-bold text-slate-950">{price} €</span></div>
          </div>
          <ErrorText>{error}</ErrorText>
          <Btn full className="mt-4" disabled={saving} onClick={confirm}>{saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer la réservation'}</Btn>
        </Card>
      )}
    </div>
  );
}
