'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  RES_STATUS, RES_STATUS_LABEL, PAY_STATUS, PAY_STATUS_LABEL, COURT_STATUS, COURT_STATUS_LABEL,
  DURATIONS, inputCls, badgeCls, toMin, toTime, overlaps, genSlots, todayISO, addDays,
  fullDateLabel, dayLabel, dayNum,
} from '@/app/_lib/shared';

// Re-exported so existing Client Component imports from this file keep working.
export {
  RES_STATUS, RES_STATUS_LABEL, PAY_STATUS, PAY_STATUS_LABEL, COURT_STATUS, COURT_STATUS_LABEL,
  DURATIONS, inputCls, badgeCls, toMin, toTime, overlaps, genSlots, todayISO, addDays,
  fullDateLabel, dayLabel, dayNum,
};

export function Badge({ children }) {
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badgeCls(children)}`}>{children}</span>;
}

export function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled, full }) {
  const base = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-lime-400 text-slate-950 hover:bg-lime-300',
    dark: 'bg-slate-950 text-white hover:bg-slate-800',
    ghost: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}>{children}</button>;
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>{children}</div>;
}

export function Field({ label, children }) {
  return <label className="block"><span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>{children}</label>;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{children}</p>;
}

export function Empty({ text }) {
  return <div className="text-center py-12 text-sm text-slate-400">{text}</div>;
}

export function Stat({ label, value, tone = 'default' }) {
  const tones = { default: 'text-slate-950', good: 'text-emerald-600', warn: 'text-amber-600' };
  return (
    <Card className="p-3.5">
      <div className={`font-bold text-2xl ${tones[tone]}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
    </Card>
  );
}

export function DateStrip({ date, onChange, days = 14 }) {
  const list = Array.from({ length: days }, (_, i) => addDays(todayISO(), i));
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {list.map((d) => (
        <button key={d} onClick={() => onChange(d)}
          className={`flex flex-col items-center justify-center min-w-[52px] py-2 rounded-xl border transition ${d === date ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
          <span className="text-[10px] uppercase font-semibold opacity-70">{dayLabel(d)}</span>
          <span className="text-base font-bold">{dayNum(d)}</span>
        </button>
      ))}
    </div>
  );
}

export function PublicHeader() {
  const { data: session, status } = useSession();
  return (
    <header className="sticky top-0 z-30 bg-slate-950 text-white px-5 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-slate-950 font-black text-sm">P</span>
        <span className="font-bold tracking-tight">Padel<span className="text-lime-400">Go</span></span>
      </Link>
      <div className="flex items-center gap-2">
        {status === 'authenticated' ? (
          <Link href={session.user.role === 'OWNER' ? '/owner' : '/client'} className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">Mon espace</Link>
        ) : (
          <>
            <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-2">Connexion</Link>
            <Link href="/register" className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">Créer un compte</Link>
          </>
        )}
      </div>
    </header>
  );
}
