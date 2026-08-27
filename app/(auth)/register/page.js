'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('CLIENT');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error); return; }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    router.push('/post-login');
  };

  return (
    <main className="max-w-sm mx-auto px-5 py-10">
      <h1 className="text-xl font-bold mb-6">Créer un compte</h1>
      <div className="flex gap-2 mb-5">
        {[['CLIENT', 'Client'], ['OWNER', 'Club / Gérant']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => setRole(v)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${role === v ? 'bg-slate-950 text-white' : 'bg-white'}`}>{l}</button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Prénom" className="w-full px-3 py-2.5 rounded-xl border border-slate-200" value={form.firstName} onChange={set('firstName')} />
        <input required placeholder="Nom" className="w-full px-3 py-2.5 rounded-xl border border-slate-200" value={form.lastName} onChange={set('lastName')} />
        <input required type="email" placeholder="E-mail" className="w-full px-3 py-2.5 rounded-xl border border-slate-200" value={form.email} onChange={set('email')} />
        <input placeholder="Téléphone" className="w-full px-3 py-2.5 rounded-xl border border-slate-200" value={form.phone} onChange={set('phone')} />
        <input required type="password" minLength={6} placeholder="Mot de passe" className="w-full px-3 py-2.5 rounded-xl border border-slate-200" value={form.password} onChange={set('password')} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button disabled={loading} className="w-full py-2.5 rounded-xl bg-lime-400 font-semibold">{loading ? '...' : 'Créer mon compte'}</button>
      </form>
    </main>
  );
}
