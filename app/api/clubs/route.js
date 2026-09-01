import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const clubSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du club est requis.'),
  description: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().min(1, "L'adresse est requise."),
  city: z.string().trim().min(1, 'La ville est requise.'),
  postalCode: z.string().trim().min(1, 'Le code postal est requis.'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('E-mail invalide.').optional().or(z.literal('')),
  whatsapp: z.string().trim().optional().or(z.literal('')),
  openHour: z.string().regex(timeRegex, "Heure d'ouverture invalide.").optional(),
  closeHour: z.string().regex(timeRegex, 'Heure de fermeture invalide.').optional(),
  pricePerHour: z.coerce.number().positive('Le prix doit être positif.').optional(),
});

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
  const parsed = clubSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const data = parsed.data;

  const club = await prisma.club.create({
    data: {
      ownerId: session.user.id,
      name: data.name,
      description: data.description || null,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      phone: data.phone || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      openHour: data.openHour || '08:00',
      closeHour: data.closeHour || '23:00',
      pricePerHour: data.pricePerHour || 24,
    },
  });

  return NextResponse.json({ club }, { status: 201 });
}
