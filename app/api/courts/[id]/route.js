import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /clubs/:id/courts — public
export async function GET(_req, { params }) {
  const courts = await prisma.court.findMany({ where: { clubId: params.id } });
  return NextResponse.json({ courts });
}

// POST /clubs/:id/courts — owner of this club only
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id: params.id } });
  if (!club) return NextResponse.json({ error: 'Club introuvable.' }, { status: 404 });
  if (club.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez gérer que les terrains de votre propre club." }, { status: 403 });
  }

  const body = await req.json();
  const court = await prisma.court.create({
    data: { clubId: params.id, name: body.name, number: body.number, type: body.type || 'Indoor' },
  });

  return NextResponse.json({ court }, { status: 201 });
}