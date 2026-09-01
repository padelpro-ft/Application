'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export const RES_STATUS = ['CONFIRMEE', 'EN_ATTENTE', 'ANNULEE', 'TERMINEE'];
export const RES_STATUS_LABEL = { CONFIRMEE: 'Confirmée', EN_ATTENTE: 'En attente', ANNULEE: 'Annulée', TERMINEE: 'Terminée' };
export const PAY_STATUS = ['NON_PAYE', 'PAYE', 'REMBOURSE'];
export const PAY_STATUS_LABEL = { NON_PAYE: 'Non payé', PAYE: 'Payé', REMBOURSE: 'Remboursé' };
export const COURT_STATUS = ['DISPONIBLE', 'INDISPONIBLE', 'MAINTENANCE'];
export const COURT_STATUS_LABEL = { DISPONIBLE: 'Disponible', INDISPONIBLE: 'Indisponible', MAINTENANCE: 'Maintenance' };
export const DURATIONS = [60, 90, 120];

export function badgeCls(label) {
  const map = {
    'Confirmée': 'bg-emerald-100 text-emerald-700', 'En attente': 'bg-amber-100 text-amber-700',
    'Annulée': 'bg-rose-100 text-rose-700', 'Terminée': 'bg-slate-200 text-slate-600',
    'Payé': 'bg-emerald-100 text-emerald-700', 'Non payé': 'bg-amber-100 text-amber-700',
    'Remboursé': 'bg-slate-200 text-slate-600', 'Disponible': 'bg-emerald-100 text-emerald-700',
    'Indisponible': 'bg-rose-100 text-rose-700', 'Maintenance': 'bg-amber-100 text-amber-700',
  };
  return map[label] || 'bg-slate-100 text-slate-600';
}

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

export const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent';

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

export function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
export function toTime(m) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
export function overlaps(aStart, aEnd, bStart, bEnd) { return toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd); }
export function genSlots(open, close, step = 30) {
  const slots = [];
  for (let m = toMin(open); m + step <= toMin(close); m += step) slots.push(toTime(m));
  return slots;
}
export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
export function fullDateLabel(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
export function dayLabel(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''); }
export function dayNum(iso) { return new Date(iso + 'T00:00:00').getDate(); }

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
