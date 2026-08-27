import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /payments/:id/status — manual "mark as paid/unpaid/refunded" (V1 has no online payment)
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Réservé aux comptes gérant.' }, { status: 403 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { reservation: { include: { club: true } } },
  });
  if (!payment) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  if (payment.reservation.club.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const { status, paymentMethod } = await req.json();
  const updated = await prisma.payment.update({
    where: { id: params.id },
    data: { status, paymentMethod, paidAt: status === 'PAYE' ? new Date() : null },
  });
  await prisma.reservation.update({ where: { id: payment.reservationId }, data: { paymentStatus: status } });

  return NextResponse.json({ payment: updated });
}
