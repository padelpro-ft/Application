'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Field, ErrorText, inputCls, DURATIONS, PAY_STATUS, PAY_STATUS_LABEL, toMin, toTime, todayISO } from '@/app/_components/ui';

export default function ManualReservationModal({ club, onClose }) {
  const router = useRouter();
  const [f, setF] = useState({ clientName: '', clientPhone: '', clientEmail: '', date: todayISO(), startTime: '09:00', duration: 60, courtId: club.courts[0]?.id || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const court = club.courts.find((c) => c.id === f.courtId);
  const price = court ? Math.round((club.pricePerHour * f.duration) / 60) : 0;

  const submit = async () => {
    setSaving(true); setError('');
    const res = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: club.id, courtId: f.courtId, date: f.date, startTime: f.startTime, duration: Number(f.duration), clientName: f.clientName, clientPhone: f.clientPhone, clientEmail: f.clientEmail }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    onClose(); router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto">
        <h3 className="font-bold text-slate-950 mb-4">Nouvelle réservation</h3>
        <div className="space-y-3">
          <Field label="Nom du client"><input className={inputCls} value={f.clientName} onChange={set('clientName')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone"><input className={inputCls} value={f.clientPhone} onChange={set('clientPhone')} /></Field>
            <Field label="E-mail"><input className={inputCls} value={f.clientEmail} onChange={set('clientEmail')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><input type="date" min={todayISO()} className={inputCls} value={f.date} onChange={set('date')} /></Field>
            <Field label="Heure"><input type="time" className={inputCls} value={f.startTime} onChange={set('startTime')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Durée">
              <select className={inputCls} value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })}>
                {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            </Field>
            <Field label="Terrain">
              <select className={inputCls} value={f.courtId} onChange={set('courtId')}>
                {club.courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="text-xs text-slate-500">Prix estimé : <span className="font-bold text-slate-900">{price} €</span></div>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2 pt-2">
            <Btn variant="ghost" full onClick={onClose}>Annuler</Btn>
            <Btn full disabled={saving} onClick={submit}>{saving ? '...' : 'Créer'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
