'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutGrid, Calendar, ClipboardList, Home, Wallet, Settings, LogOut } from 'lucide-react';

const TABS = [
  { href: '/owner', label: 'Dashboard', icon: LayoutGrid },
  { href: '/owner/planning', label: 'Planning', icon: Calendar },
  { href: '/owner/reservations', label: 'Résa.', icon: ClipboardList },
  { href: '/owner/courts', label: 'Terrains', icon: Home },
  { href: '/owner/billing', label: 'Factu.', icon: Wallet },
  { href: '/owner/club', label: 'Club', icon: Settings },
];

export default function OwnerLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-slate-950 text-white px-5 py-3 flex items-center justify-between">
        <Link href="/owner" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-slate-950 font-black text-sm">P</span>
          <span className="font-bold tracking-tight">Padel<span className="text-lime-400">Go</span> <span className="text-slate-400 font-normal text-xs">— Espace gérant</span></span>
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-300 hidden sm:inline">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-1 text-slate-300 hover:text-white"><LogOut size={14} />Déconnexion</button>
        </div>
      </header>
      <nav className="bg-white border-b border-slate-200 px-2 flex overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon; const active = pathname === t.href;
          return (
            <Link key={t.href} href={t.href} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${active ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>
              <Icon size={16} />{t.label}
            </Link>
          );
        })}
      </nav>
      <main className="max-w-5xl mx-auto px-5 py-6">{children}</main>
    </div>
  );
}
