import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PlanningGrid from '../_components/PlanningGrid';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id }, include: { courts: true } });
  if (!club) return <OwnerOnboardingForm />;
  return <PlanningGrid club={club} />;
}
