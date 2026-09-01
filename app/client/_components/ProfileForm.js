'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Btn, Field, inputCls } from '@/app/_components/ui';

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [f, setF] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    setSaved(false);
    await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setSaved(true); router.refresh();
  };

  return (
    <div className="px-5 py-5 max-w-sm">
      <h2 className="text-lg font-bold text-slate-950 mb-4">Mon profil</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom"><input className={inputCls} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
          <Field label="Nom"><input className={inputCls} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
        </div>
        <Field label="E-mail"><input disabled className={`${inputCls} bg-slate-50 text-slate-400`} value={user.email} /></Field>
        <Field label="Téléphone"><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Btn full className="!mt-4" onClick={submit}>{saved ? <CheckCircle2 size={16} /> : 'Enregistrer'}</Btn>
      </div>
    </div>
  );
}
