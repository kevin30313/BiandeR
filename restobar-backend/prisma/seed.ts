import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'restobar2026';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Usuarios iniciales del sistema bajo el dominio @errandbi.com
  const usersToSeed = [
    {
      name: 'Administrador Sistema',
      email: 'admin@errandbi.com',
      role: Role.ADMIN,
    },
    {
      name: 'Caja Principal',
      email: 'caja@errandbi.com',
      role: Role.CASHIER,
    },
    {
      name: 'Garzon Turno',
      email: 'mesero@errandbi.com',
      role: Role.WAITER,
    },
    {
      name: 'Cocina Central',
      email: 'kitchen@errandbi.com',
      role: Role.KITCHEN,
    },
  ];

  for (const user of usersToSeed) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  // 2. Mesas iniciales
  for (let i = 1; i <= 5; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    });
  }

  console.log('✅ Base de datos poblada y usuarios sincronizados con éxito (@errandbi.com)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });