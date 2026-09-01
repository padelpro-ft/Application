'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Field, inputCls } from '@/app/_components/ui';
import { CheckCircle2 } from 'lucide-react';

export default function ClubSettingsForm({ club }) {
  const router = useRouter();
  const [f, setF] = useState({ ...club });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSaved(false);
    await fetch(`/api/clubs/${club.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setSaved(true); router.refresh();
  };

  return (
    <div className="max-w-sm">
      <h2 className="text-lg font-bold text-slate-950 mb-4">Mon club</h2>
      <div className="space-y-3">
        <Field label="Nom"><input className={inputCls} value={f.name} onChange={set('name')} /></Field>
        <Field label="Description"><textarea rows={3} className={inputCls} value={f.description || ''} onChange={set('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Adresse"><input className={inputCls} value={f.address} onChange={set('address')} /></Field>
          <Field label="Ville"><input className={inputCls} value={f.city} onChange={set('city')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone"><input className={inputCls} value={f.phone || ''} onChange={set('phone')} /></Field>
          <Field label="E-mail"><input className={inputCls} value={f.email || ''} onChange={set('email')} /></Field>
        </div>
        <Field label="WhatsApp"><input className={inputCls} value={f.whatsapp || ''} onChange={set('whatsapp')} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Ouverture"><input type="time" className={inputCls} value={f.openHour} onChange={set('openHour')} /></Field>
          <Field label="Fermeture"><input type="time" className={inputCls} value={f.closeHour} onChange={set('closeHour')} /></Field>
          <Field label="Prix / h (€)"><input type="number" className={inputCls} value={f.pricePerHour} onChange={set('pricePerHour')} /></Field>
        </div>
        <Btn full className="!mt-4" onClick={submit}>{saved ? <CheckCircle2 size={16} /> : 'Enregistrer'}</Btn>
      </div>
    </div>
  );
}
