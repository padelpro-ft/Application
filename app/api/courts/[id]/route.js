import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /courts/:id — update status (Disponible / Indisponible / Maintenance) — owner of the parent club only
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const court = await prisma.court.findUnique({ where: { id: params.id }, include: { club: true } });
  if (!court) return NextResponse.json({ error: 'Terrain introuvable.' }, { status: 404 });
  if (court.club.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez gérer que les terrains de votre propre club." }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.court.update({
    where: { id: params.id },
    data: { name: body.name, number: body.number, type: body.type, status: body.status },
  });

  return NextResponse.json({ court: updated });
}

// DELETE /courts/:id
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const court = await prisma.court.findUnique({ where: { id: params.id }, include: { club: true } });
  if (!court) return NextResponse.json({ error: 'Terrain introuvable.' }, { status: 404 });
  if (court.club.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  await prisma.court.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
