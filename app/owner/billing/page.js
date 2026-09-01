import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BillingView from '../_components/BillingView';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id } });
  if (!club) return <OwnerOnboardingForm />;
  const reservations = await prisma.reservation.findMany({ where: { clubId: club.id } });
  return <BillingView reservations={reservations} />;
}
