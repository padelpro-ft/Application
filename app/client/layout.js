'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Search, ClipboardList, Settings, LogOut } from 'lucide-react';

const TABS = [
  { href: '/client', label: 'Accueil', icon: Home },
  { href: '/clubs', label: 'Clubs', icon: Search },
  { href: '/client/reservations', label: 'Réservations', icon: ClipboardList },
  { href: '/client/profile', label: 'Profil', icon: Settings },
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-30 bg-slate-950 text-white px-5 py-3 flex items-center justify-between">
        <Link href="/client" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-slate-950 font-black text-sm">P</span>
          <span className="font-bold tracking-tight">Padel<span className="text-lime-400">Go</span></span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white">
          <span className="hidden xs:inline">{session?.user?.name}</span><LogOut size={15} />
        </button>
      </header>
      <main className="max-w-xl mx-auto">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex">
        {TABS.map((t) => {
          const Icon = t.icon; const active = pathname === t.href;
          return (
            <Link key={t.href} href={t.href} className="flex-1 flex flex-col items-center gap-0.5 py-2.5">
              <Icon size={19} className={active ? 'text-slate-950' : 'text-slate-400'} strokeWidth={active ? 2.4 : 2} />
              <span className={`text-[10px] font-semibold ${active ? 'text-slate-950' : 'text-slate-400'}`}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
