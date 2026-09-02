'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/app/_components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { setError('6 caractères minimum.'); return; }

    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  if (!token) {
    return (
      <div>
        <PublicHeader />
        <main className="max-w-sm mx-auto px-5 py-10 text-sm text-rose-600">Lien invalide — refaites une demande depuis la page "mot de passe oublié".</main>
      </div>
    );
  }

  return (
    <div>
      <PublicHeader />
      <main className="max-w-sm mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-6">Nouveau mot de passe</h1>
        {done ? (
          <div className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-4">Mot de passe mis à jour, redirection vers la connexion...</div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input required type="password" minLength={6} placeholder="Nouveau mot de passe" className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <input required type="password" minLength={6} placeholder="Confirmer le mot de passe" className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button disabled={loading} className="w-full py-2.5 rounded-xl bg-lime-400 font-semibold">{loading ? '...' : 'Valider'}</button>
          </form>
        )}
        <Link href="/login" className="block text-center text-xs text-slate-400 mt-4">← Retour à la connexion</Link>
      </main>
    </div>
  );
}
