import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /clubs/:id — public club page
export async function GET(_req, { params }) {
  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: { courts: true },
  });
  if (!club) return NextResponse.json({ error: 'Club introuvable.' }, { status: 404 });
  return NextResponse.json({ club });
}

// PUT /clubs/:id — owner of THIS club only
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id: params.id } });
  if (!club) return NextResponse.json({ error: 'Club introuvable.' }, { status: 404 });
  if (club.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez modifier que votre propre club." }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.club.update({
    where: { id: params.id },
    data: {
      name: body.name, description: body.description, address: body.address, city: body.city,
      postalCode: body.postalCode, phone: body.phone, email: body.email, whatsapp: body.whatsapp,
      openHour: body.openHour, closeHour: body.closeHour, pricePerHour: Number(body.pricePerHour),
    },
  });

  return NextResponse.json({ club: updated });
}
