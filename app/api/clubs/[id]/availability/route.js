import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /clubs/:id/availability?date=YYYY-MM-DD
// Public endpoint: only exposes courtId/startTime/endTime for confirmed
// reservations that day, so the client-side booking grid can grey out
// taken slots — never exposes other clients' names/contact details.
export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'Paramètre date manquant.' }, { status: 400 });

  const reservations = await prisma.reservation.findMany({
    where: { clubId: params.id, date: new Date(date), reservationStatus: { not: 'ANNULEE' } },
    select: { courtId: true, startTime: true, endTime: true },
  });

  return NextResponse.json({ reservations });
}
