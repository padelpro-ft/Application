// Run with: npm run db:seed
// Creates one demo owner + club + courts + a demo client, so you can log
// in immediately after `prisma migrate dev` without registering by hand.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const ownerPasswordHash = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'club@padelgo.demo' },
    update: {},
    create: {
      firstName: 'Paddle', lastName: 'Club Paris', email: 'club@padelgo.demo',
      phone: '0102030405', passwordHash: ownerPasswordHash, role: 'OWNER',
    },
  });

  const club = await prisma.club.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      ownerId: owner.id, name: 'Paddle Club Paris', description: 'Club premium au coeur de Paris.',
      address: '10 rue du Sport', city: 'Paris', postalCode: '75012', phone: '0102030405',
      email: 'contact@padelclubparis.demo', openHour: '08:00', closeHour: '23:00', pricePerHour: 32,
      courts: { create: [{ name: 'Terrain 1', number: '1', type: 'Indoor' }, { name: 'Terrain 2', number: '2', type: 'Outdoor' }] },
    },
  });

  const clientPasswordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'client@padelgo.demo' },
    update: {},
    create: {
      firstName: 'Jean', lastName: 'Dupont', email: 'client@padelgo.demo',
      phone: '0607080910', passwordHash: clientPasswordHash, role: 'CLIENT',
    },
  });

  console.log('Seed OK — club:', club.name, '| owner login: club@padelgo.demo / password123', '| client login: client@padelgo.demo / password123');
}

main().finally(() => prisma.$disconnect());
