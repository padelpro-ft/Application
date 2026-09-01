import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const courtSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du terrain est requis.'),
  number: z.string().trim().optional().or(z.literal('')),
  type: z.enum(['Indoor', 'Outdoor', 'Panoramique']).optional(),
});

// GET /clubs/:clubId/courts — public
export async function GET(_req, { params }) {
  const courts = await prisma.court.findMany({ where: { clubId: params.id } });
  return NextResponse.json({ courts });
}

// POST /clubs/:clubId/courts — owner of this club only
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const club = await prisma.club.findUnique({ where: { id: params.id } });
  if (!club) return NextResponse.json({ error: 'Club introuvable.' }, { status: 404 });
  if (club.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez gérer que les terrains de votre propre club." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = courtSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const court = await prisma.court.create({
    data: { clubId: params.id, name: parsed.data.name, number: parsed.data.number || null, type: parsed.data.type || 'Indoor' },
  });

  return NextResponse.json({ court }, { status: 201 });
}
