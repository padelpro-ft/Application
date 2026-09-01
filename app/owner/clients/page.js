import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, Empty, fullDateLabel } from '@/app/_components/ui';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id } });
  if (!club) return <OwnerOnboardingForm />;

  // Group by the contact details recorded on each reservation (works for both
  // registered clients and manually-entered walk-ins) rather than by clientId,
  // since manual reservations have no linked User account.
  const grouped = await prisma.reservation.groupBy({
    by: ['clientName', 'clientPhone', 'clientEmail'],
    where: { clubId: club.id, reservationStatus: { not: 'ANNULEE' } },
    _count: { id: true },
    _sum: { price: true },
    _max: { date: true },
    orderBy: { _max: { date: 'desc' } },
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950 mb-4">Clients</h2>
      {grouped.length === 0 && <Empty text="Aucun client pour le moment." />}
      <div className="space-y-2.5">
        {grouped.map((c, i) => (
          <Card key={i} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-950">{c.clientName}</div>
              <div className="text-xs text-slate-400">{c.clientPhone || '—'}{c.clientEmail ? ` · ${c.clientEmail}` : ''}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dernière visite : {fullDateLabel(c._max.date.toISOString().slice(0, 10))}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{c._count.id} résa.</div>
              <div className="text-xs text-slate-500">{c._sum.price} € au total</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
