import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true },
  });
  return NextResponse.json({ user });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const { firstName, lastName, phone } = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { firstName, lastName, phone },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true },
  });
  return NextResponse.json({ user });
}
