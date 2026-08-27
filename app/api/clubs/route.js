import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /clubs — public listing, optionally filtered by city/name
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const clubs = await prisma.club.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }] }
      : undefined,
    include: { courts: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ clubs });
}

// POST /clubs — OWNER only, one club per owner
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Réservé aux comptes gérant.' }, { status: 403 });
  }

  const existing = await prisma.club.findUnique({ where: { ownerId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà un club.' }, { status: 409 });
  }

  const body = await req.json();
  const club = await prisma.club.create({
    data: {
      ownerId: session.user.id,
      name: body.name,
      description: body.description,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      phone: body.phone,
      email: body.email,
      whatsapp: body.whatsapp,
      openHour: body.openHour || '08:00',
      closeHour: body.closeHour || '23:00',
      pricePerHour: Number(body.pricePerHour) || 24,
    },
  });

  return NextResponse.json({ club }, { status: 201 });
}
