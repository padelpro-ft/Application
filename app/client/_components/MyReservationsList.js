'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Empty, ErrorText, fullDateLabel, RES_STATUS_LABEL, todayISO } from '@/app/_components/ui';

export default function MyReservationsList({ reservations }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const sorted = [...reservations].sort((a, b) => (a.date.toISOString() + a.startTime).localeCompare(b.date.toISOString() + b.startTime));

  const cancel = async (id) => {
    setErrors((e) => ({ ...e, [id]: '' }));
    const res = await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reservationStatus: 'ANNULEE' }) });
    const data = await res.json();
    if (!res.ok) { setErrors((e) => ({ ...e, [id]: data.error })); return; }
    router.refresh();
  };

  return (
    <div className="px-5 py-5">
      <h2 className="text-lg font-bold text-slate-950 mb-4">Mes réservations</h2>
      {sorted.length === 0 && <Empty text="Vous n'avez pas encore réservé de terrain." />}
      <div className="space-y-3">
        {sorted.map((r) => {
          const dateStr = r.date.toISOString().slice(0, 10);
          const past = dateStr < todayISO();
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-950">{r.club.name}</span>
                <Badge>{RES_STATUS_LABEL[r.reservationStatus]}</Badge>
              </div>
              <div className="text-xs text-slate-500 mb-2">{fullDateLabel(dateStr)} · {r.startTime}–{r.endTime} · {r.court.name}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>{r.paymentStatus === 'PAYE' ? 'Payé' : r.paymentStatus === 'REMBOURSE' ? 'Remboursé' : 'Non payé'}</Badge>
                  <span className="text-xs font-semibold text-slate-700">{r.price} €</span>
                </div>
                {r.reservationStatus === 'CONFIRMEE' && !past && (
                  <button onClick={() => cancel(r.id)} className="text-xs font-semibold text-rose-600">Annuler</button>
                )}
              </div>
              {errors[r.id] && <div className="mt-2"><ErrorText>{errors[r.id]}</ErrorText></div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
