'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Field, ErrorText, inputCls } from '@/app/_components/ui';

export default function OwnerOnboardingForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: '', description: '', address: '', city: '', postalCode: '', phone: '', email: '', whatsapp: '', openHour: '08:00', closeHour: '23:00', pricePerHour: 24 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSaving(true); setError('');
    const res = await fetch('/api/clubs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, pricePerHour: Number(f.pricePerHour) || 24 }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    router.refresh();
  };

  return (
    <div className="max-w-sm">
      <h2 className="text-xl font-bold text-slate-950 mb-1">Créez votre club</h2>
      <p className="text-sm text-slate-500 mb-5">Ces informations apparaîtront sur votre page publique.</p>
      <div className="space-y-3">
        <Field label="Nom du club"><input className={inputCls} value={f.name} onChange={set('name')} /></Field>
        <Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={set('description')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Adresse"><input className={inputCls} value={f.address} onChange={set('address')} /></Field>
          <Field label="Ville"><input className={inputCls} value={f.city} onChange={set('city')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code postal"><input className={inputCls} value={f.postalCode} onChange={set('postalCode')} /></Field>
          <Field label="Téléphone"><input className={inputCls} value={f.phone} onChange={set('phone')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail club"><input className={inputCls} value={f.email} onChange={set('email')} /></Field>
          <Field label="WhatsApp (optionnel)"><input className={inputCls} value={f.whatsapp} onChange={set('whatsapp')} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Ouverture"><input type="time" className={inputCls} value={f.openHour} onChange={set('openHour')} /></Field>
          <Field label="Fermeture"><input type="time" className={inputCls} value={f.closeHour} onChange={set('closeHour')} /></Field>
          <Field label="Prix / h (€)"><input type="number" min="1" className={inputCls} value={f.pricePerHour} onChange={set('pricePerHour')} /></Field>
        </div>
        <ErrorText>{error}</ErrorText>
        <Btn full disabled={saving} onClick={submit} className="!mt-4">{saving ? '...' : 'Créer mon club'}</Btn>
      </div>
    </div>
  );
}
