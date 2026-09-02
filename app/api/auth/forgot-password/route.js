import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'E-mail requis.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always respond the same way whether or not the account exists — this
  // prevents the endpoint from being used to find out which e-mails are
  // registered on the platform.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // valid 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: 'PadelGo <onboarding@resend.dev>',
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe PadelGo',
        html: `<p>Bonjour ${user.firstName},</p><p>Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>`,
      });
    } catch (e) {
      console.error('Resend send error:', e);
    }
  }

  return NextResponse.json({ ok: true });
}
