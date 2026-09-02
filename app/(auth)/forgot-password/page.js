'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/app/_components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    });
    setLoading(false); setSent(true);
  };

  return (
    <div>
      <PublicHeader />
      <main className="max-w-sm mx-auto px-5 py-10">
        <h1 className="text-xl font-bold mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-slate-500 mb-6">Indiquez votre e-mail, on vous envoie un lien pour en choisir un nouveau.</p>

        {sent ? (
          <div className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-4">
            Si un compte existe avec cette adresse, un e-mail vient de vous être envoyé. Pensez à vérifier vos spams.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input required type="email" placeholder="E-mail" className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button disabled={loading} className="w-full py-2.5 rounded-xl bg-lime-400 font-semibold">
              {loading ? '...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
        <Link href="/login" className="block text-center text-xs text-slate-400 mt-4">← Retour à la connexion</Link>
      </main>
    </div>
  );
}
