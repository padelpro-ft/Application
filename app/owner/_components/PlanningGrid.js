'use client';
import { useEffect, useState } from 'react';
import { DateStrip, genSlots, toMin, toTime, overlaps, todayISO, COURT_STATUS_LABEL } from '@/app/_components/ui';

export default function PlanningGrid({ club }) {
  const [date, setDate] = useState(todayISO());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reservations?date=${date}`).then((r) => r.json()).then((d) => { setReservations(d.reservations || []); setLoading(false); });
  }, [date]);

  const slots = genSlots(club.openHour, club.closeHour, 60);

  const cellInfo = (courtId, courtStatus, slot) => {
    if (courtStatus !== 'DISPONIBLE') return { label: COURT_STATUS_LABEL[courtStatus], cls: 'bg-amber-50 text-amber-600' };
    const hit = reservations.find((r) => r.courtId === courtId && overlaps(slot, toTime(toMin(slot) + 60), r.startTime, r.endTime));
    if (hit) return { label: hit.clientName.split(' ')[0], cls: 'bg-slate-950 text-white' };
    return { label: 'Libre', cls: 'bg-emerald-50 text-emerald-600' };
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950 mb-4">Planning</h2>
      <DateStrip date={date} onChange={setDate} />
      {loading ? <p className="text-sm text-slate-400 mt-4">Chargement...</p> : (
        <div className="overflow-x-auto -mx-5 px-5 mt-4">
          <div className="min-w-[560px] border border-slate-200 rounded-2xl overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: `64px repeat(${club.courts.length}, 1fr)` }}>
              <div className="bg-slate-950" />
              {club.courts.map((c) => <div key={c.id} className="bg-slate-950 text-white text-[11px] font-bold text-center py-2 border-l border-slate-800 truncate px-1">{c.name}</div>)}
              {slots.map((s) => (
                <>
                  <div key={s} className="text-[10px] text-slate-400 font-semibold text-center py-2.5 border-t border-slate-100">{s}</div>
                  {club.courts.map((c) => {
                    const info = cellInfo(c.id, c.status, s);
                    return <div key={c.id + s} className={`border-t border-l border-slate-100 h-10 flex items-center justify-center text-[10px] font-semibold px-1 truncate ${info.cls}`}>{info.label}</div>;
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
