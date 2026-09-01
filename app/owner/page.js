import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OwnerOnboardingForm from './_components/OwnerOnboardingForm';
import OwnerDashboardView from './_components/OwnerDashboardView';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id }, include: { courts: true } });

  if (!club) return <OwnerOnboardingForm />;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

  const [todayRes, weekRes, pendingPayment, paidCount] = await Promise.all([
    prisma.reservation.findMany({ where: { clubId: club.id, date: today, reservationStatus: { not: 'ANNULEE' } } }),
    prisma.reservation.findMany({ where: { clubId: club.id, date: { gte: today, lt: weekEnd }, reservationStatus: { not: 'ANNULEE' } } }),
    prisma.reservation.count({ where: { clubId: club.id, paymentStatus: 'NON_PAYE', reservationStatus: { not: 'ANNULEE' } } }),
    prisma.reservation.count({ where: { clubId: club.id, paymentStatus: 'PAYE' } }),
  ]);

  const stats = {
    todayCount: todayRes.length,
    weekCount: weekRes.length,
    availableCourts: club.courts.filter((c) => c.status === 'DISPONIBLE').length,
    occupiedToday: new Set(todayRes.map((r) => r.courtId)).size,
    weekRevenue: weekRes.reduce((s, r) => s + r.price, 0),
    pendingPayment,
    paidCount,
  };

  return <OwnerDashboardView club={club} stats={stats} />;
}
