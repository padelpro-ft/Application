import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ClubSettingsForm from '../_components/ClubSettingsForm';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function ClubSettingsPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id } });
  if (!club) return <OwnerOnboardingForm />;
  return <ClubSettingsForm club={club} />;
}
