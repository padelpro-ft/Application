'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Btn, Card, Field, inputCls, COURT_STATUS, COURT_STATUS_LABEL, badgeCls } from '@/app/_components/ui';

const COURT_TYPES = ['Indoor', 'Outdoor', 'Panoramique'];

function CourtFormModal({ clubId, court, onClose }) {
  const router = useRouter();
  const isEdit = !!court;
  const [f, setF] = useState(court ? { name: court.name, number: court.number || '', type: court.type } : { name: '', number: '', type: 'Indoor' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    if (isEdit) {
      await fetch(`/api/courts/${court.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, status: court.status }) });
    } else {
      await fetch(`/api/clubs/${clubId}/courts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    }
    setSaving(false); onClose(); router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5">
        <h3 className="font-bold text-slate-950 mb-4">{isEdit ? 'Modifier le terrain' : 'Ajouter un terrain'}</h3>
        <div className="space-y-3">
          <Field label="Nom du terrain"><input className={inputCls} placeholder="Terrain 1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Numéro"><input className={inputCls} value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} /></Field>
          <Field label="Type">
            <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              {COURT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 pt-2">
            <Btn variant="ghost" full onClick={onClose}>Annuler</Btn>
            <Btn full disabled={saving || !f.name} onClick={submit}>{saving ? '...' : isEdit ? 'Enregistrer' : 'Ajouter'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourtsManager({ club }) {
  const router = useRouter();
  const [modalCourt, setModalCourt] = useState(undefined); // undefined = closed, null = add, court = edit

  const setStatus = async (courtId, status) => {
    await fetch(`/api/courts/${courtId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    router.refresh();
  };

  const remove = async (courtId) => {
    if (!confirm('Supprimer ce terrain ? Cette action est irréversible.')) return;
    await fetch(`/api/courts/${courtId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-950">Terrains</h2>
        <Btn onClick={() => setModalCourt(null)} className="!px-3 !py-2"><Plus size={15} />Ajouter</Btn>
      </div>
      <div className="space-y-2.5">
        {club.courts.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-950 truncate">{c.name}</div>
              <div className="text-xs text-slate-400">{c.type}{c.number ? ` · n°${c.number}` : ''}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)} className={`text-xs font-semibold rounded-full px-2.5 py-1.5 border-0 ${badgeCls(COURT_STATUS_LABEL[c.status])}`}>
                {COURT_STATUS.map((s) => <option key={s} value={s}>{COURT_STATUS_LABEL[s]}</option>)}
              </select>
              <button onClick={() => setModalCourt(c)} className="p-1.5 text-slate-400 hover:text-slate-700"><Pencil size={15} /></button>
              <button onClick={() => remove(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
            </div>
          </Card>
        ))}
        {club.courts.length === 0 && <p className="text-sm text-slate-400">Aucun terrain — ajoutez-en un pour commencer à recevoir des réservations.</p>}
      </div>
      {modalCourt !== undefined && <CourtFormModal clubId={club.id} court={modalCourt} onClose={() => setModalCourt(undefined)} />}
    </div>
  );
}
