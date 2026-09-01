import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReservationsManager from '../_components/ReservationsManager';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function OwnerReservationsPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id }, include: { courts: true } });
  if (!club) return <OwnerOnboardingForm />;
  const reservations = await prisma.reservation.findMany({ where: { clubId: club.id }, include: { court: true }, orderBy: { date: 'desc' } });
  return <ReservationsManager club={club} reservations={reservations} />;
}
