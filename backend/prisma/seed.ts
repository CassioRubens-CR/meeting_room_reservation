import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.reservation.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123456', 10),
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('user1234567', 10),
      role: Role.USER,
    },
  });

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'Sala de Reunião A',
      capacity: 10,
      location: '1º Andar',
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Sala de Reunião B',
      capacity: 20,
      location: '2º Andar',
    },
  });

  console.log('✓ Seeding completed');
  console.log('Admin user:', adminUser);
  console.log('Regular user:', regularUser);
  console.log('Room 1:', room1);
  console.log('Room 2:', room2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
