import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function canAccess(session, reservation) {
  if (!session) return false;
  if (session.user.role === 'CLIENT') return reservation.clientId === session.user.id;
  const club = await prisma.club.findUnique({ where: { id: reservation.clubId } });
  return club?.ownerId === session.user.id;
}

// GET /reservations/:id
export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: { court: true, club: true },
  });
  if (!reservation) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  if (!(await canAccess(session, reservation))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  return NextResponse.json({ reservation });
}

// PUT /reservations/:id — status changes (cancel, mark paid, etc.)
// A CLIENT may only cancel their own reservation; an OWNER may change
// any status/payment field on a reservation that belongs to their club.
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  const reservation = await prisma.reservation.findUnique({ where: { id: params.id } });
  if (!reservation) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  if (!(await canAccess(session, reservation))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const body = await req.json();
  const data = {};

  if (session.user.role === 'CLIENT') {
    // Clients can only cancel — nothing else
    if (body.reservationStatus !== 'ANNULEE') {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }
    data.reservationStatus = 'ANNULEE';
  } else {
    if (body.reservationStatus) data.reservationStatus = body.reservationStatus;
    if (body.paymentStatus) {
      data.paymentStatus = body.paymentStatus;
      await prisma.payment.update({
        where: { reservationId: reservation.id },
        data: { status: body.paymentStatus, paidAt: body.paymentStatus === 'PAYE' ? new Date() : null },
      }).catch(() => {});
    }
  }

  const updated = await prisma.reservation.update({ where: { id: params.id }, data });
  return NextResponse.json({ reservation: updated });
}
