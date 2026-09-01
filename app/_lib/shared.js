// Plain data/logic helpers — deliberately NOT marked 'use client'.
// Server Components (pages that fetch via Prisma directly) must import
// constants and pure functions from here rather than from
// app/_components/ui.js: that file is 'use client', and Next.js cannot
// turn plain values (objects, functions) from a client module into
// something a Server Component can use directly — only React components
// can safely cross that boundary. Client Components can still import
// these from ui.js (which re-exports them) without any issue.

export const RES_STATUS = ['CONFIRMEE', 'EN_ATTENTE', 'ANNULEE', 'TERMINEE'];
export const RES_STATUS_LABEL = { CONFIRMEE: 'Confirmée', EN_ATTENTE: 'En attente', ANNULEE: 'Annulée', TERMINEE: 'Terminée' };
export const PAY_STATUS = ['NON_PAYE', 'PAYE', 'REMBOURSE'];
export const PAY_STATUS_LABEL = { NON_PAYE: 'Non payé', PAYE: 'Payé', REMBOURSE: 'Remboursé' };
export const COURT_STATUS = ['DISPONIBLE', 'INDISPONIBLE', 'MAINTENANCE'];
export const COURT_STATUS_LABEL = { DISPONIBLE: 'Disponible', INDISPONIBLE: 'Indisponible', MAINTENANCE: 'Maintenance' };
export const DURATIONS = [60, 90, 120];

export const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent';

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
