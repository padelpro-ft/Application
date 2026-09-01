'use client';
import { useState } from 'react';
import { Stat, todayISO, addDays } from '@/app/_components/ui';

export default function BillingView({ reservations }) {
  const [range, setRange] = useState('week');
  const today = todayISO();
  const from = range === 'today' ? today : range === 'week' ? addDays(today, -7) : range === 'month' ? addDays(today, -30) : '0000-00-00';

  const filtered = reservations.filter((r) => {
    const d = r.date.toISOString().slice(0, 10);
    return d >= from && d <= today && r.reservationStatus !== 'ANNULEE';
  });
  const paidRes = filtered.filter((r) => r.paymentStatus === 'PAYE');
  const unpaidRes = filtered.filter((r) => r.paymentStatus !== 'PAYE');
  const theoretical = filtered.reduce((s, r) => s + r.price, 0);
  const paidAmount = paidRes.reduce((s, r) => s + r.price, 0);

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950 mb-4">Facturation</h2>
      <div className="flex gap-2 mb-4">
        {[['today', "Aujourd'hui"], ['week', '7 jours'], ['month', '30 jours'], ['all', 'Tout']].map(([v, l]) => (
          <button key={v} onClick={() => setRange(v)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${range === v ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-500 border-slate-200'}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Réservations" value={filtered.length} />
        <Stat label="Payées" value={paidRes.length} tone="good" />
        <Stat label="Non payées" value={unpaidRes.length} tone="warn" />
        <Stat label="CA théorique" value={`${theoretical} €`} />
        <Stat label="CA encaissé" value={`${paidAmount} €`} tone="good" />
        <Stat label="Reste à encaisser" value={`${theoretical - paidAmount} €`} tone="warn" />
      </div>
      <p className="text-[11px] text-slate-400 mt-4">Suivi des réservations et paiements — prêt pour l'ajout futur de Stripe.</p>
    </div>
  );
}
