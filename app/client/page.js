import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, Badge, Empty } from '@/app/_components/ui';
import { fullDateLabel, RES_STATUS_LABEL } from '@/app/_lib/shared';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientHomePage() {
  const session = await getServerSession(authOptions);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const upcoming = await prisma.reservation.findFirst({
    where: { clientId: session.user.id, date: { gte: today }, reservationStatus: 'CONFIRMEE' },
    include: { club: true, court: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return (
    <div className="px-5 py-6">
      <h2 className="text-xl font-bold text-slate-950">Bonjour {session.user.name?.split(' ')[0]} 👋</h2>
      <p className="text-sm text-slate-500 mt-1 mb-5">Prêt à taper quelques balles ?</p>
      <Link href="/clubs" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm bg-lime-400 text-slate-950 mb-6">
        Réserver un terrain <ArrowRight size={16} />
      </Link>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Prochaine réservation</div>
      {upcoming ? (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-950">{upcoming.club.name}</span>
            <Badge>{RES_STATUS_LABEL[upcoming.reservationStatus]}</Badge>
          </div>
          <div className="text-xs text-slate-500">{fullDateLabel(upcoming.date.toISOString().slice(0, 10))} · {upcoming.startTime}–{upcoming.endTime} · {upcoming.court.name}</div>
        </Card>
      ) : <Empty text="Aucune réservation à venir." />}
    </div>
  );
}
