import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const reservationSchema = z.object({
  clubId: z.string().min(1),
  courtId: z.string().min(1),
  date: z.string().regex(dateRegex, 'Date invalide.'),
  startTime: z.string().regex(timeRegex, 'Heure invalide.'),
  duration: z.coerce.number().refine((d) => [60, 90, 120].includes(d), 'Durée invalide.'),
  clientName: z.string().trim().optional(),
  clientPhone: z.string().trim().optional(),
  clientEmail: z.string().trim().email('E-mail invalide.').optional().or(z.literal('')),
});

function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// GET /reservations — a CLIENT sees their own; an OWNER sees their club's
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  let where = {};
  if (session.user.role === 'CLIENT') {
    where.clientId = session.user.id;
  } else {
    const club = await prisma.club.findUnique({ where: { ownerId: session.user.id } });
    if (!club) return NextResponse.json({ reservations: [] });
    where.clubId = club.id;
  }
  if (date) where.date = new Date(date);

  const reservations = await prisma.reservation.findMany({
    where,
    include: { court: true, club: true },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
  });

  return NextResponse.json({ reservations });
}

// POST /reservations — create a reservation.
// The overlap check + insert run inside a single serializable transaction so
// two simultaneous requests for the same court/slot can never both succeed —
// this is the real enforcement; any check done in the UI is just for UX.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { clubId, courtId, date, startTime, duration, clientName, clientPhone, clientEmail } = parsed.data;

  if (session?.user?.role === 'OWNER' && !clientName) {
    return NextResponse.json({ error: 'Le nom du client est requis.' }, { status: 400 });
  }
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || court.clubId !== clubId) {
    return NextResponse.json({ error: 'Terrain introuvable.' }, { status: 404 });
  }
  if (court.status !== 'DISPONIBLE') {
    return NextResponse.json({ error: 'Ce terrain n’est pas disponible.' }, { status: 409 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  const endTime = addMinutes(startTime, duration);
  const price = Math.round((club.pricePerHour * duration) / 60);

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      // Overlap: existing.start < new.end AND new.start < existing.end
      const conflict = await tx.reservation.findFirst({
        where: {
          courtId,
          date: new Date(date),
          reservationStatus: { not: 'ANNULEE' },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (conflict) {
        throw new Error('SLOT_TAKEN');
      }

      return tx.reservation.create({
        data: {
          clubId, courtId, date: new Date(date), startTime, endTime, duration, price,
          clientId: session?.user?.role === 'CLIENT' ? session.user.id : null,
          clientName: session?.user?.role === 'CLIENT' ? session.user.name : clientName,
          clientPhone: clientPhone || null,
          clientEmail: session?.user?.role === 'CLIENT' ? session.user.email : clientEmail || null,
          reservationStatus: 'CONFIRMEE',
          paymentStatus: 'NON_PAYE',
          payment: { create: { amount: price, status: 'NON_PAYE', paymentMethod: 'ONLINE_FUTURE' } },
        },
      });
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    if (err.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'Ce créneau vient d’être réservé. Choisissez-en un autre.' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Erreur lors de la création de la réservation.' }, { status: 500 });
  }
}
