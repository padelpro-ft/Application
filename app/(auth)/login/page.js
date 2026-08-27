'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    setLoading(false);
    if (res?.error) { setError('E-mail ou mot de passe incorrect.'); return; }
    // Redirect based on role is handled by middleware once the session cookie is set;
    // send them to a neutral post-login route that forwards by role.
    router.push('/post-login');
  };

  return (
    <main className="max-w-sm mx-auto px-5 py-10">
      <h1 className="text-xl font-bold mb-6">Connexion</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required type="email" placeholder="E-mail" className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Mot de passe" className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button disabled={loading} className="w-full py-2.5 rounded-xl bg-lime-400 font-semibold">
          {loading ? '...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
