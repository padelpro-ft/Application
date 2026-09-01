import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MyReservationsList from '../_components/MyReservationsList';

export const dynamic = 'force-dynamic';

export default async function MyReservationsPage() {
  const session = await getServerSession(authOptions);
  const reservations = await prisma.reservation.findMany({
    where: { clientId: session.user.id },
    include: { club: true, court: true },
    orderBy: { date: 'desc' },
  });
  return <MyReservationsList reservations={reservations} />;
}
