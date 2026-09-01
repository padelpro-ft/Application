'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Btn, Card, Badge, Empty, fullDateLabel, badgeCls, RES_STATUS, RES_STATUS_LABEL } from '@/app/_components/ui';
import ManualReservationModal from './ManualReservationModal';

export default function ReservationsManager({ club, reservations }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const sorted = [...reservations].sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));

  const changeStatus = async (id, reservationStatus) => {
    await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reservationStatus }) });
    router.refresh();
  };
  const markPaid = async (id) => {
    await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'PAYE' }) });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-950">Réservations</h2>
        <Btn onClick={() => setShowAdd(true)} className="!px-3 !py-2"><Plus size={15} />Ajouter</Btn>
      </div>
      {sorted.length === 0 && <Empty text="Aucune réservation pour le moment." />}
      <div className="space-y-3">
        {sorted.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-950">{r.clientName}</span>
              <span className="text-xs font-bold text-slate-700">{r.price} €</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">{fullDateLabel(r.date.toISOString().slice(0, 10))} · {r.startTime}–{r.endTime} · {r.court.name}</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <select value={r.reservationStatus} onChange={(e) => changeStatus(r.id, e.target.value)} className={`text-[11px] font-semibold rounded-full px-2 py-1 border-0 ${badgeCls(RES_STATUS_LABEL[r.reservationStatus])}`}>
                {RES_STATUS.map((s) => <option key={s} value={s}>{RES_STATUS_LABEL[s]}</option>)}
              </select>
              <Badge>{r.paymentStatus === 'PAYE' ? 'Payé' : r.paymentStatus === 'REMBOURSE' ? 'Remboursé' : 'Non payé'}</Badge>
              {r.paymentStatus !== 'PAYE' && <button onClick={() => markPaid(r.id)} className="text-[11px] font-bold text-emerald-700 underline ml-auto">Marquer payé</button>}
            </div>
          </Card>
        ))}
      </div>
      {showAdd && <ManualReservationModal club={club} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
