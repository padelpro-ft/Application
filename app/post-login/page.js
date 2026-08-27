'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Small forwarding page: sends the freshly-logged-in user to the right
// space depending on their role, which the /owner and /client middleware
// then continues to enforce on every subsequent request.
export default function PostLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    router.replace(session.user.role === 'OWNER' ? '/owner' : '/client');
  }, [status, session, router]);

  return <main className="min-h-screen flex items-center justify-center text-slate-400">Connexion...</main>;
}
