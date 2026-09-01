import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CourtsManager from '../_components/CourtsManager';
import OwnerOnboardingForm from '../_components/OwnerOnboardingForm';

export const dynamic = 'force-dynamic';

export default async function CourtsPage() {
  const session = await getServerSession(authOptions);
  const club = await prisma.club.findUnique({ where: { ownerId: session.user.id }, include: { courts: true } });
  if (!club) return <OwnerOnboardingForm />;
  return <CourtsManager club={club} />;
}
